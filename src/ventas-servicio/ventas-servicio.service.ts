import { Injectable, NotFoundException } from '@nestjs/common';
import {
    DireccionCuentaColaborador,
    MetodoCobroServicio,
    Prisma,
    TipoMovimientoColaborador,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaServicioDto } from './dto/create-venta-servicio.dto';
import { UpdateVentaServicioDto } from './dto/update-venta-servicio.dto';
import { CreateMovimientoCuentaColaboradorDto } from './dto/create-movimiento-cuenta-colaborador.dto';
import { UpdateMovimientoCuentaColaboradorDto } from './dto/update-movimiento-cuenta-colaborador.dto';

@Injectable()
export class VentasServicioService {
    constructor(private prisma: PrismaService) { }
    private getSaleImpact(sale: {
        paymentMethod: MetodoCobroServicio;
        commissionAmount: number;
        companyNet: number;
    }) {
        return sale.paymentMethod === MetodoCobroServicio.EFECTIVO
            ? -Number(sale.companyNet ?? 0)
            : Number(sale.commissionAmount ?? 0);
    }
    private today() {
        return new Date().toISOString().slice(0, 10);
    }

    private nowIso() {
        return new Date().toISOString();
    }

    private calcAmounts(input: {
        amount?: number;
        commissionPercent?: number;
    }) {
        const amount = Number(input.amount ?? 0);
        const commissionPercent = Number(input.commissionPercent ?? 0);
        const commissionAmount = Number(((amount * commissionPercent) / 100).toFixed(2));
        const companyNet = Number((amount - commissionAmount).toFixed(2));

        return { amount, commissionPercent, commissionAmount, companyNet };
    }

    private movementDelta(
        direction: DireccionCuentaColaborador,
        amount: number,
    ) {
        return direction === DireccionCuentaColaborador.EMPRESA_DEBE_COLABORADOR
            ? amount
            : -amount;
    }

    private async applyCollaboratorBalance(
        collaboratorId: string,
        delta: number,
    ) {
        await this.prisma.colaborador.update({
            where: { id: collaboratorId },
            data: {
                saldoActual: { increment: delta },
            },
        });
    }

    private async reverseSaleEffects(sale: {
        collaboratorId?: string | null;
        paymentMethod: MetodoCobroServicio;
        commissionAmount: number;
        companyNet: number;
    }) {
        if (!sale.collaboratorId) return;

        const delta =
            sale.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                ? -Number(sale.commissionAmount ?? 0)
                : Number(sale.companyNet ?? 0);

        await this.applyCollaboratorBalance(sale.collaboratorId, delta);
    }

    private async applySaleEffects(sale: {
        collaboratorId?: string | null;
        paymentMethod: MetodoCobroServicio;
        commissionAmount: number;
        companyNet: number;
    }) {
        if (!sale.collaboratorId) return;

        const delta =
            sale.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                ? Number(sale.commissionAmount ?? 0)
                : -Number(sale.companyNet ?? 0);

        await this.applyCollaboratorBalance(sale.collaboratorId, delta);
    }

    // Ventas

    async createSale(dto: CreateVentaServicioDto) {
        const { amount, commissionPercent, commissionAmount, companyNet } =
            this.calcAmounts(dto);

        const sale = await this.prisma.ventaServicio.create({
            data: {
                date: dto.date,
                description: dto.description,
                serviceType: dto.serviceType,
                paymentMethod: dto.paymentMethod,
                collaboratorId: dto.collaboratorId,
                clientId: dto.clientId,
                clientName: dto.clientName,
                amount,
                commissionPercent,
                commissionAmount,
                companyNet,
                notes: dto.notes,
                createdAt: dto.createdAt ?? this.today(),
                updatedAt: this.nowIso(),
                deletedAt: null,
                deletedReason: null,
            },
        });

        if (dto.collaboratorId) {
            const direction =
                dto.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                    ? DireccionCuentaColaborador.EMPRESA_DEBE_COLABORADOR
                    : DireccionCuentaColaborador.COLABORADOR_DEBE_EMPRESA;

            const movementAmount =
                dto.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                    ? commissionAmount
                    : companyNet;

            await this.prisma.movimientoCuentaColaborador.create({
                data: {
                    collaboratorId: dto.collaboratorId,
                    saleId: sale.id,
                    type: TipoMovimientoColaborador.VENTA,
                    direction,
                    amount: movementAmount,
                    paidAmount: 0,
                    pendingAmount: movementAmount,
                    createdAt: this.today(),
                    notes: dto.notes,
                    deletedAt: null,
                },
            });

            await this.applySaleEffects({
                collaboratorId: dto.collaboratorId,
                paymentMethod: dto.paymentMethod,
                commissionAmount,
                companyNet,
            });
        }

        return sale;
    }

    async findAllSales(params: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
        search?: string;
        from?: string;
        to?: string;
    }) {
        const page = Math.max(1, params.page ?? 1);
        const take = Math.max(1, params.limit ?? 10);
        const skip = (page - 1) * take;

        const where: Prisma.VentaServicioWhereInput = {
            deletedAt: null,
            ...(params.search
                ? {
                    OR: [
                        { description: { contains: params.search, mode: 'insensitive' } },
                        { serviceType: { contains: params.search, mode: 'insensitive' } },
                        { clientName: { contains: params.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(params.from || params.to
                ? {
                    date: {
                        ...(params.from ? { gte: params.from } : {}),
                        ...(params.to ? { lte: params.to } : {}),
                    },
                }
                : {}),
        };

        const sortField = params.sort ?? 'date';
        const sortOrder = params.order ?? 'desc';

        const [items, total] = await this.prisma.$transaction([
            this.prisma.ventaServicio.findMany({
                skip,
                take,
                where,
                orderBy: {
                    [sortField]: sortOrder,
                } as Prisma.VentaServicioOrderByWithRelationInput,
            }),
            this.prisma.ventaServicio.count({ where }),
        ]);

        return { items, total };
    }

    async findOneSale(id: string) {
        const item = await this.prisma.ventaServicio.findFirst({
            where: { id, deletedAt: null },
        });

        if (!item) {
            throw new NotFoundException('Venta no encontrada');
        }

        return item;
    }

    async updateSale(id: string, dto: UpdateVentaServicioDto) {
        const current = await this.findOneSale(id);

        // 1) Revertir el impacto anterior
        if (current.collaboratorId) {
            const reverseOldImpact = this.getSaleImpact(current) * -1;

            await this.prisma.colaborador.update({
                where: { id: current.collaboratorId },
                data: {
                    saldoActual: { increment: reverseOldImpact },
                },
            });
        }

        // 2) Anular movimientos viejos de esa venta
        await this.prisma.movimientoCuentaColaborador.updateMany({
            where: { saleId: id },
            data: { deletedAt: this.nowIso() },
        });

        // 3) Recalcular montos con los nuevos datos
        const merged = {
            ...current,
            ...dto,
        };

        const { amount, commissionPercent, commissionAmount, companyNet } =
            this.calcAmounts(merged);

        // 4) Actualizar la venta
        const updated = await this.prisma.ventaServicio.update({
            where: { id },
            data: {
                ...dto,
                amount,
                commissionPercent,
                commissionAmount,
                companyNet,
                updatedAt: this.nowIso(),
            },
        });

        // 5) Aplicar el nuevo impacto
        if (updated.collaboratorId) {
            const impact = this.getSaleImpact({
                paymentMethod: updated.paymentMethod,
                commissionAmount,
                companyNet,
            });

            await this.prisma.colaborador.update({
                where: { id: updated.collaboratorId },
                data: {
                    saldoActual: { increment: impact },
                },
            });

            const direction =
                updated.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                    ? DireccionCuentaColaborador.EMPRESA_DEBE_COLABORADOR
                    : DireccionCuentaColaborador.COLABORADOR_DEBE_EMPRESA;

            const movementAmount =
                updated.paymentMethod === MetodoCobroServicio.TRANSFERENCIA
                    ? commissionAmount
                    : companyNet;

            await this.prisma.movimientoCuentaColaborador.create({
                data: {
                    collaboratorId: updated.collaboratorId,
                    saleId: updated.id,
                    type: TipoMovimientoColaborador.VENTA,
                    direction,
                    amount: movementAmount,
                    paidAmount: 0,
                    pendingAmount: movementAmount,
                    createdAt: this.today(),
                    notes: updated.notes ?? undefined,
                },
            });
        }

        return updated;
    }
    async removeSale(id: string, reason?: string) {
        const current = await this.findOneSale(id);

        // 1) Revertir el impacto de la venta sobre el saldo del colaborador
        if (current.collaboratorId) {
            const reverseImpact = this.getSaleImpact(current) * -1;

            await this.prisma.colaborador.update({
                where: { id: current.collaboratorId },
                data: {
                    saldoActual: { increment: reverseImpact },
                },
            });
        }

        // 2) Marcar como eliminado el movimiento asociado a esa venta
        await this.prisma.movimientoCuentaColaborador.updateMany({
            where: { saleId: id },
            data: {
                deletedAt: this.nowIso(),
            },
        });

        // 3) Marcar como eliminada la venta
        return this.prisma.ventaServicio.update({
            where: { id },
            data: {
                deletedAt: this.nowIso(),
                deletedReason: reason,
                updatedAt: this.nowIso(),
            },
        });
    }

    // Movimientos de cuenta colaborador

    async createMovement(dto: CreateMovimientoCuentaColaboradorDto) {
        const amount = Number(dto.amount ?? 0);
        const paidAmount = Number(dto.paidAmount ?? 0);
        const pendingAmount =
            dto.pendingAmount !== undefined && dto.pendingAmount !== null
                ? Number(dto.pendingAmount)
                : amount - paidAmount;

        const movement = await this.prisma.movimientoCuentaColaborador.create({
            data: {
                collaboratorId: dto.collaboratorId,
                saleId: dto.saleId,
                type: dto.type,
                direction: dto.direction,
                amount,
                paidAmount,
                pendingAmount,
                paidAt: dto.paidAt,
                notes: dto.notes,
                createdAt: this.today(),
            },
        });

        const delta = this.movementDelta(dto.direction, amount);
        await this.applyCollaboratorBalance(dto.collaboratorId, delta);

        return movement;
    }

    async findAllMovements(params: {
        collaboratorId?: string;
        saleId?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Math.max(1, params.page ?? 1);
        const take = Math.max(1, params.limit ?? 10);
        const skip = (page - 1) * take;

        const where: Prisma.MovimientoCuentaColaboradorWhereInput = {
            AND: [
                {
                    OR: [
                        { deletedAt: null },
                        { deletedAt: { isSet: false } },
                    ],
                },
                ...(params.collaboratorId ? [{ collaboratorId: params.collaboratorId }] : []),
                ...(params.saleId ? [{ saleId: params.saleId }] : []),
            ],
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.movimientoCuentaColaborador.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.movimientoCuentaColaborador.count({ where }),
        ]);

        return { items, total };
    }

    async findOneMovement(id: string) {
        const item = await this.prisma.movimientoCuentaColaborador.findFirst({
            where: {
                id,
                OR: [
                    { deletedAt: null },
                    { deletedAt: { isSet: false } },
                ],
            },
        });

        if (!item) {
            throw new NotFoundException('Movimiento no encontrado');
        }

        return item;
    }

    async updateMovement(
        id: string,
        dto: UpdateMovimientoCuentaColaboradorDto,
    ) {
        const current = await this.findOneMovement(id);

        const oldDelta = this.movementDelta(current.direction, current.amount);
        await this.applyCollaboratorBalance(current.collaboratorId, -oldDelta);

        const amount =
            dto.amount !== undefined ? Number(dto.amount) : current.amount;
        const paidAmount =
            dto.paidAmount !== undefined ? Number(dto.paidAmount) : current.paidAmount;
        const pendingAmount =
            dto.pendingAmount !== undefined
                ? Number(dto.pendingAmount)
                : amount - paidAmount;

        const updated = await this.prisma.movimientoCuentaColaborador.update({
            where: { id },
            data: {
                ...dto,
                amount,
                paidAmount,
                pendingAmount,
            },
        });

        const newDelta = this.movementDelta(updated.direction, updated.amount);
        await this.applyCollaboratorBalance(updated.collaboratorId, newDelta);

        return updated;
    }

    async removeMovement(id: string) {
        const current = await this.findOneMovement(id);

        const delta = this.movementDelta(current.direction, current.amount);
        await this.applyCollaboratorBalance(current.collaboratorId, -delta);

        return this.prisma.movimientoCuentaColaborador.update({
            where: { id },
            data: {
                deletedAt: this.nowIso(),
            },
        });
    }
}