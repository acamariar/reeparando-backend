import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    DireccionCuentaColaborador,
    EstadoSeguimiento,
    MetodoCobroServicio,
    Prisma,
    TipoMovimientoColaborador,
    TipoVisitaSeguimiento,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { FinalizarSeguimientoDto } from './dto/finalizar-seguimiento.dto';
import { JwtPayload } from 'src/auth/types/jwt-payload/jwt-payload';

@Injectable()
export class SeguimientosService {
    constructor(private prisma: PrismaService) { }

    private nowIso() {
        return new Date().toISOString();
    }

    private money(value?: number | null) {
        return Number(value ?? 0);
    }

    private async findByNumeroVisita(numeroVisita: string) {
        return this.prisma.seguimiento.findFirst({
            where: {
                numeroVisita,
                deletedAt: null,
            },
        });
    }

    private async assertRelations(dto: {
        clientId: string;
        colaboradorId?: string | null;
    }) {
        const client = await this.prisma.cliente.findFirst({
            where: { id: dto.clientId },
        });

        if (!client) {
            throw new BadRequestException('El cliente no existe');
        }

        if (dto.colaboradorId) {
            const colaborador = await this.prisma.colaborador.findFirst({
                where: { id: dto.colaboradorId, deletedAt: null },
            });

            if (!colaborador) {
                throw new BadRequestException('El colaborador no existe');
            }
        }
    }

    private getCollaboratorDelta(
        paymentMethod: MetodoCobroServicio | null | undefined,
        montoColaborador: number,
        montoReeparando: number,
    ) {
        if (!paymentMethod) return 0;

        return paymentMethod === MetodoCobroServicio.TRANSFERENCIA
            ? Number(montoColaborador ?? 0)
            : -Number(montoReeparando ?? 0);
    }
    private async applyCollaboratorBalance(collaboratorId: string, delta: number) {
        await this.prisma.colaborador.update({
            where: { id: collaboratorId },
            data: {
                saldoActual: { increment: delta },
            },
        });
    }

    private async applyFinalizedImpact(seg: {
        colaboradorId?: string | null;
        paymentMethod: MetodoCobroServicio | null | undefined;
        montoColaborador: number;
        montoReeparando: number;
    }) {
        if (!seg.colaboradorId) return;

        const delta = this.getCollaboratorDelta(
            seg.paymentMethod,
            seg.montoColaborador,
            seg.montoReeparando,
        );

        await this.applyCollaboratorBalance(seg.colaboradorId, delta);
    }

    private async reverseFinalizedImpact(seg: {
        colaboradorId?: string | null;
        paymentMethod: MetodoCobroServicio | null | undefined;
        montoColaborador: number;
        montoReeparando: number;
    }) {
        if (!seg.colaboradorId) return;

        const delta =
            this.getCollaboratorDelta(
                seg.paymentMethod,
                seg.montoColaborador,
                seg.montoReeparando,
            ) * -1;

        await this.applyCollaboratorBalance(seg.colaboradorId, delta);
    }

    private async deleteFinancialRecords(seguimientoId: string) {
        await this.prisma.seguimientoComision.updateMany({
            where: {
                seguimientoId,
                deletedAt: null,
            },
            data: {
                deletedAt: this.nowIso(),
            },
        });
    }

    private async createFinancialRecords(input: {
        seguimientoId: string;
        colaboradorId?: string | null;
        paymentMethod: MetodoCobroServicio;
        montoPagadoCliente: number;
        montoColaborador: number;
        montoReeparando: number;
        notes?: string | null;
    }) {
        if (!input.colaboradorId) return;

        const percentage =
            input.montoPagadoCliente > 0
                ? Number(((input.montoColaborador * 100) / input.montoPagadoCliente).toFixed(2))
                : 0;

        await this.prisma.seguimientoComision.create({
            data: {
                seguimientoId: input.seguimientoId,
                colaboradorId: input.colaboradorId,
                percentage,
                amount: Number(input.montoColaborador ?? 0),
                paidAt: null,
                notes: input.notes ?? null,
                deletedAt: null,
            },
        });
    }

    async create(dto: CreateSeguimientoDto, user: JwtPayload) {
        const numeroVisita = dto.numeroVisita.trim();

        const exists = await this.findByNumeroVisita(numeroVisita);
        if (exists) {
            throw new ConflictException('Ese número de visita ya existe');
        }

        await this.assertRelations({
            clientId: dto.clientId,
            colaboradorId: dto.colaboradorId ?? null,
        });

        const montoPresupuestado = this.money(dto.montoPresupuestado);

        if (
            dto.tipoVisita === TipoVisitaSeguimiento.TECNICA &&
            montoPresupuestado <= 0
        ) {
            throw new BadRequestException(
                'El monto presupuestado es obligatorio para una visita técnica',
            );
        }

        const created = await this.prisma.seguimiento.create({
            data: {
                numeroVisita,
                clientId: dto.clientId,
                colaboradorId: dto.colaboradorId ?? null,
                direccionServicio: dto.direccionServicio.trim(),
                tipoVisita: dto.tipoVisita,
                zona: dto.zona?.trim() || null,
                fechaSolicitud: dto.fechaSolicitud,
                fechaVisita: dto.fechaVisita ?? null,
                servicioRequerido: dto.servicioRequerido.trim(),
                tipoServicio: dto.tipoServicio?.trim() || null,
                origenCliente: dto.origenCliente,
                estado: dto.estado ?? EstadoSeguimiento.A_COORDINAR,
                montoPresupuestado,
                montoPagadoCliente: 0,
                montoColaborador: 0,
                montoReeparando: 0,
                fechaLimiteGarantia: dto.fechaLimiteGarantia ?? null,
                observacionesCliente: dto.observacionesCliente?.trim() || null,
                observacionesTecnicas: dto.observacionesTecnicas?.trim() || null,
                createdAt: this.nowIso(),
                updatedAt: this.nowIso(),
                deletedAt: null,
                deletedReason: null,
                createdById: user.sub,
                updatedById: user.sub,
            },
            include: {
                client: true,
                colaborador: true,
                comisiones: true,
            },
        });

        return created;
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
        search?: string;
        estado?: EstadoSeguimiento;
        tipoVisita?: TipoVisitaSeguimiento;
        from?: string;
        to?: string;
    }) {
        const page = Math.max(1, params.page ?? 1);
        const take = Math.max(1, params.limit ?? 10);
        const skip = (page - 1) * take;
        const sortField = params.sort ?? 'fechaSolicitud';
        const sortOrder = params.order ?? 'desc';

        const where: Prisma.SeguimientoWhereInput = {
            deletedAt: null,
            ...(params.estado ? { estado: params.estado } : {}),
            ...(params.tipoVisita ? { tipoVisita: params.tipoVisita } : {}),
            ...(params.search
                ? {
                    OR: [
                        { numeroVisita: { contains: params.search, mode: 'insensitive' } },
                        { direccionServicio: { contains: params.search, mode: 'insensitive' } },
                        { zona: { contains: params.search, mode: 'insensitive' } },
                        { servicioRequerido: { contains: params.search, mode: 'insensitive' } },
                        { tipoServicio: { contains: params.search, mode: 'insensitive' } },
                        { observacionesCliente: { contains: params.search, mode: 'insensitive' } },
                        { observacionesTecnicas: { contains: params.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(params.from || params.to
                ? {
                    fechaSolicitud: {
                        ...(params.from ? { gte: params.from } : {}),
                        ...(params.to ? { lte: params.to } : {}),
                    },
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.seguimiento.findMany({
                where,
                skip,
                take,
                orderBy: {
                    [sortField]: sortOrder,
                } as Prisma.SeguimientoOrderByWithRelationInput,
                include: {
                    client: true,
                    colaborador: true,
                    comisiones: true,
                },
            }),
            this.prisma.seguimiento.count({ where }),
        ]);

        return { items, total };
    }

    async findOne(id: string) {
        const item = await this.prisma.seguimiento.findFirst({
            where: { id, deletedAt: null },
            include: {
                client: true,
                colaborador: true,
                comisiones: true,
            },
        });

        if (!item) {
            throw new NotFoundException('Seguimiento no encontrado');
        }

        return item;
    }

    async update(id: string, dto: UpdateSeguimientoDto, user: JwtPayload) {
        const current = await this.findOne(id);

        if (dto.numeroVisita && dto.numeroVisita.trim() !== current.numeroVisita) {
            const exists = await this.findByNumeroVisita(dto.numeroVisita.trim());
            if (exists) {
                throw new ConflictException('Ese número de visita ya existe');
            }
        }

        if (dto.clientId) {
            const client = await this.prisma.cliente.findFirst({
                where: { id: dto.clientId },
            });

            if (!client) {
                throw new BadRequestException('El cliente no existe');
            }
        }

        if (dto.colaboradorId) {
            const colaborador = await this.prisma.colaborador.findFirst({
                where: { id: dto.colaboradorId, deletedAt: null },
            });

            if (!colaborador) {
                throw new BadRequestException('El colaborador no existe');
            }
        }

        const wasFinalized = current.estado === EstadoSeguimiento.CULMINADO;

        if (wasFinalized) {
            await this.reverseFinalizedImpact(current);
            await this.deleteFinancialRecords(current.id);
        }

        const updated = await this.prisma.seguimiento.update({
            where: { id },
            data: {
                ...(dto.numeroVisita !== undefined ? { numeroVisita: dto.numeroVisita.trim() } : {}),
                ...(dto.clientId !== undefined ? { clientId: dto.clientId } : {}),
                ...(dto.colaboradorId !== undefined
                    ? { colaboradorId: dto.colaboradorId || null }
                    : {}),
                ...(dto.direccionServicio !== undefined
                    ? { direccionServicio: dto.direccionServicio.trim() }
                    : {}),
                ...(dto.tipoVisita !== undefined ? { tipoVisita: dto.tipoVisita } : {}),
                ...(dto.zona !== undefined ? { zona: dto.zona?.trim() || null } : {}),
                ...(dto.fechaSolicitud !== undefined ? { fechaSolicitud: dto.fechaSolicitud } : {}),
                ...(dto.fechaVisita !== undefined ? { fechaVisita: dto.fechaVisita || null } : {}),
                ...(dto.servicioRequerido !== undefined
                    ? { servicioRequerido: dto.servicioRequerido.trim() }
                    : {}),
                ...(dto.tipoServicio !== undefined
                    ? { tipoServicio: dto.tipoServicio?.trim() || null }
                    : {}),
                ...(dto.origenCliente !== undefined ? { origenCliente: dto.origenCliente } : {}),
                ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
                ...(dto.montoPresupuestado !== undefined
                    ? { montoPresupuestado: this.money(dto.montoPresupuestado) }
                    : {}),
                ...(dto.montoPagadoCliente !== undefined
                    ? { montoPagadoCliente: this.money(dto.montoPagadoCliente) }
                    : {}),
                ...(dto.montoColaborador !== undefined
                    ? { montoColaborador: this.money(dto.montoColaborador) }
                    : {}),
                ...(dto.montoReeparando !== undefined
                    ? { montoReeparando: this.money(dto.montoReeparando) }
                    : {}),
                ...(dto.fechaLimiteGarantia !== undefined
                    ? { fechaLimiteGarantia: dto.fechaLimiteGarantia || null }
                    : {}),
                ...(dto.observacionesCliente !== undefined
                    ? { observacionesCliente: dto.observacionesCliente?.trim() || null }
                    : {}),
                ...(dto.observacionesTecnicas !== undefined
                    ? { observacionesTecnicas: dto.observacionesTecnicas?.trim() || null }
                    : {}),
                updatedAt: this.nowIso(),
                updatedById: user.sub,
            },
            include: {
                client: true,
                colaborador: true,
                comisiones: true,
            },
        });

        if (updated.estado === EstadoSeguimiento.CULMINADO && updated.colaboradorId) {
            if (!updated.paymentMethod) {
                throw new BadRequestException(
                    'La forma de cobro es obligatoria para finalizar',
                );
            }

            await this.applyFinalizedImpact({
                colaboradorId: updated.colaboradorId,
                paymentMethod: updated.paymentMethod,
                montoColaborador: updated.montoColaborador,
                montoReeparando: updated.montoReeparando,
            });

            await this.createFinancialRecords({
                seguimientoId: updated.id,
                colaboradorId: updated.colaboradorId,
                paymentMethod: updated.paymentMethod,
                montoPagadoCliente: updated.montoPagadoCliente,
                montoColaborador: updated.montoColaborador,
                montoReeparando: updated.montoReeparando,
                notes: updated.observacionesTecnicas ?? updated.observacionesCliente ?? null,
            });
        }

        return updated;
    }

    async finalizar(id: string, dto: FinalizarSeguimientoDto, user: JwtPayload) {
        const current = await this.findOne(id);

        if (!current.colaboradorId) {
            throw new BadRequestException('No se puede finalizar sin un colaborador asignado');
        }

        if (current.estado === EstadoSeguimiento.CULMINADO) {
            await this.reverseFinalizedImpact(current);
            await this.deleteFinancialRecords(current.id);
        }

        if (!dto.paymentMethod) {
            throw new BadRequestException('La forma de cobro es obligatoria para finalizar');
        }

        const updated = await this.prisma.seguimiento.update({
            where: { id },
            data: {
                estado: EstadoSeguimiento.CULMINADO,
                paymentMethod: dto.paymentMethod,
                montoPagadoCliente: this.money(dto.montoPagadoCliente),
                montoColaborador: this.money(dto.montoColaborador),
                montoReeparando: this.money(dto.montoReeparando),
                fechaLimiteGarantia: dto.fechaLimiteGarantia ?? null,
                fechaFinalizacion: dto.fechaFinalizacion ?? null,
                observacionesCliente: dto.observacionesCliente?.trim() || null,
                observacionesTecnicas: dto.observacionesTecnicas?.trim() || null,
                updatedAt: this.nowIso(),
                updatedById: user.sub,
            },
            include: {
                client: true,
                colaborador: true,
                comisiones: true,
            },
        });

        const direction =
            updated.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                ? DireccionCuentaColaborador.EMPRESA_DEBE_COLABORADOR
                : DireccionCuentaColaborador.COLABORADOR_DEBE_EMPRESA;

        const movementAmount =
            updated.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                ? updated.montoColaborador
                : updated.montoReeparando;

        await this.prisma.movimientoCuentaColaborador.create({
            data: {
                collaboratorId: updated.colaboradorId as string,
                seguimientoId: updated.id,
                type: TipoMovimientoColaborador.SEGUIMIENTO,
                direction,
                amount: movementAmount,
                paidAmount: 0,
                pendingAmount: movementAmount,
                createdAt: this.nowIso(),
                paidAt: null,
                notes: updated.observacionesTecnicas ?? updated.observacionesCliente ?? null,
                deletedAt: null,
            },
        });

        await this.applyCollaboratorBalance(
            updated.colaboradorId as string,
            direction === DireccionCuentaColaborador.EMPRESA_DEBE_COLABORADOR
                ? movementAmount
                : -movementAmount,
        );

        return updated;
    }

    async remove(id: string, reason?: string) {
        const current = await this.findOne(id);

        if (current.estado === EstadoSeguimiento.CULMINADO && current.paymentMethod) {
            await this.reverseFinalizedImpact(current);
            await this.deleteFinancialRecords(current.id);
        }

        return this.prisma.seguimiento.update({
            where: { id },
            data: {
                deletedAt: this.nowIso(),
                deletedReason: reason?.trim() || null,
                updatedAt: this.nowIso(),
            },
        });
    }
}
