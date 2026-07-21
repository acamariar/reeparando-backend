import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeguimientoComisionDto } from './dto/create-seguimiento-comision.dto';
import { UpdateSeguimientoComisionDto } from './dto/update-seguimiento-comision.dto';

@Injectable()
export class SeguimientoComisionService {
    constructor(private prisma: PrismaService) { }

    private nowIso() {
        return new Date().toISOString();
    }

    private async assertRelations(seguimientoId: string, colaboradorId: string) {
        const seguimiento = await this.prisma.seguimiento.findFirst({
            where: { id: seguimientoId, deletedAt: null },
        });

        if (!seguimiento) {
            throw new BadRequestException('El seguimiento no existe');
        }

        const colaborador = await this.prisma.colaborador.findFirst({
            where: { id: colaboradorId, deletedAt: null },
        });

        if (!colaborador) {
            throw new BadRequestException('El colaborador no existe');
        }
    }

    async create(dto: CreateSeguimientoComisionDto) {
        await this.assertRelations(dto.seguimientoId, dto.colaboradorId);

        return this.prisma.seguimientoComision.create({
            data: {
                seguimientoId: dto.seguimientoId,
                colaboradorId: dto.colaboradorId,
                percentage: Number(dto.percentage ?? 0),
                amount: Number(dto.amount ?? 0),
                paidAt: dto.paidAt ?? null,
                notes: dto.notes?.trim() || null,
                deletedAt: null,
            },
            include: {
                seguimiento: true,
                colaborador: true,
            },
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        seguimientoId?: string;
        colaboradorId?: string;
    }) {
        const page = Math.max(1, params.page ?? 1);
        const take = Math.max(1, params.limit ?? 10);
        const skip = (page - 1) * take;

        const where = {
            deletedAt: null,
            ...(params.seguimientoId ? { seguimientoId: params.seguimientoId } : {}),
            ...(params.colaboradorId ? { colaboradorId: params.colaboradorId } : {}),
            ...(params.search
                ? {
                    OR: [
                        { notes: { contains: params.search, mode: 'insensitive' as const } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.seguimientoComision.findMany({
                where,
                skip,
                take,
                orderBy: { id: 'desc' },
                include: {
                    seguimiento: true,
                    colaborador: true,
                },
            }),
            this.prisma.seguimientoComision.count({ where }),
        ]);

        return { items, total };
    }

    async findOne(id: string) {
        const item = await this.prisma.seguimientoComision.findFirst({
            where: { id, deletedAt: null },
            include: {
                seguimiento: true,
                colaborador: true,
            },
        });

        if (!item) {
            throw new NotFoundException('Comisión no encontrada');
        }

        return item;
    }

    async update(id: string, dto: UpdateSeguimientoComisionDto) {
        await this.findOne(id);

        if (dto.seguimientoId && dto.colaboradorId) {
            await this.assertRelations(dto.seguimientoId, dto.colaboradorId);
        }

        return this.prisma.seguimientoComision.update({
            where: { id },
            data: {
                ...(dto.seguimientoId !== undefined ? { seguimientoId: dto.seguimientoId } : {}),
                ...(dto.colaboradorId !== undefined ? { colaboradorId: dto.colaboradorId } : {}),
                ...(dto.percentage !== undefined ? { percentage: Number(dto.percentage ?? 0) } : {}),
                ...(dto.amount !== undefined ? { amount: Number(dto.amount ?? 0) } : {}),
                ...(dto.paidAt !== undefined ? { paidAt: dto.paidAt || null } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
            },
            include: {
                seguimiento: true,
                colaborador: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.seguimientoComision.update({
            where: { id },
            data: {
                deletedAt: this.nowIso(),
            },
        });
    }
}