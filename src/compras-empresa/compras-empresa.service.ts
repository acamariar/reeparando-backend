import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, CompraEmpresa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraEmpresaDto } from './dto/create-compra-empresa.dto';
import { UpdateCompraEmpresaDto } from './dto/update-compra-empresa.dto';

@Injectable()
export class ComprasEmpresaService {
    constructor(private prisma: PrismaService) { }

    private nowIso() {
        return new Date().toISOString();
    }

    private async ensureInvoiceRefUnique(invoiceRef: string, excludeId?: string) {
        const exists = await this.prisma.compraEmpresa.findFirst({
            where: {
                invoiceRef,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });

        if (exists) {
            throw new ConflictException(`La referencia de factura ${invoiceRef} ya existe`);
        }
    }

    async create(dto: CreateCompraEmpresaDto) {
        const invoiceRef = dto.invoiceRef.trim();

        await this.ensureInvoiceRefUnique(invoiceRef);

        return this.prisma.compraEmpresa.create({
            data: {
                date: dto.date,
                concept: dto.concept.trim(),
                category: dto.category.trim(),
                amount: Number(dto.amount ?? 0),
                provider: dto.provider?.trim() || null,
                invoiceRef,
                notes: dto.notes?.trim() || null,
                createdAt: dto.createdAt ?? this.nowIso(),
                updatedAt: this.nowIso(),
                deletedAt: null,
                deletedReason: null,
            },
        });
    }

    async findAll(params: {
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
        const sortField = params.sort ?? 'date';
        const sortOrder = params.order ?? 'desc';

        const where: Prisma.CompraEmpresaWhereInput = {
            deletedAt: null,
            ...(params.search
                ? {
                    OR: [
                        { concept: { contains: params.search, mode: 'insensitive' } },
                        { category: { contains: params.search, mode: 'insensitive' } },
                        { provider: { contains: params.search, mode: 'insensitive' } },
                        { invoiceRef: { contains: params.search, mode: 'insensitive' } },
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

        const [items, total] = await this.prisma.$transaction([
            this.prisma.compraEmpresa.findMany({
                where,
                skip,
                take,
                orderBy: {
                    [sortField]: sortOrder,
                } as Prisma.CompraEmpresaOrderByWithRelationInput,
            }),
            this.prisma.compraEmpresa.count({ where }),
        ]);

        return { items, total };
    }

    async findOne(id: string) {
        const item = await this.prisma.compraEmpresa.findFirst({
            where: { id, deletedAt: null },
        });

        if (!item) {
            throw new NotFoundException('Compra no encontrada');
        }

        return item;
    }

    async update(id: string, dto: UpdateCompraEmpresaDto) {
        await this.findOne(id);

        if (dto.invoiceRef) {
            await this.ensureInvoiceRefUnique(dto.invoiceRef.trim(), id);
        }

        return this.prisma.compraEmpresa.update({
            where: { id },
            data: {
                ...(dto.date !== undefined ? { date: dto.date } : {}),
                ...(dto.concept !== undefined ? { concept: dto.concept.trim() } : {}),
                ...(dto.category !== undefined ? { category: dto.category.trim() } : {}),
                ...(dto.amount !== undefined ? { amount: Number(dto.amount ?? 0) } : {}),
                ...(dto.provider !== undefined
                    ? { provider: dto.provider?.trim() || null }
                    : {}),
                ...(dto.invoiceRef !== undefined
                    ? { invoiceRef: dto.invoiceRef.trim() }
                    : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
                updatedAt: this.nowIso(),
            },
        });
    }

    async remove(id: string, reason?: string) {
        await this.findOne(id);

        return this.prisma.compraEmpresa.update({
            where: { id },
            data: {
                deletedAt: this.nowIso(),
                deletedReason: reason?.trim() || null,
                updatedAt: this.nowIso(),
            },
        });
    }
}