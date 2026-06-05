import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@Injectable()
export class ColaboradoresService {
    constructor(private prisma: PrismaService) { }

    private today() {
        return new Date().toISOString().slice(0, 10);
    }

    private nowIso() {
        return new Date().toISOString();
    }

    async create(dto: CreateColaboradorDto) {
        return this.prisma.colaborador.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                email: dto.email,
                alias: dto.alias,
                notes: dto.notes,
                active: dto.active ?? true,
                createdAt: dto.createdAt ?? this.today(),
                saldoActual: 0,
            },
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
        search?: string;
    }) {
        const page = Math.max(1, params.page ?? 1);
        const take = Math.max(1, params.limit ?? 10);
        const skip = (page - 1) * take;
        const sortField = params.sort ?? 'lastName';
        const sortOrder = params.order ?? 'asc';

        const where: Prisma.ColaboradorWhereInput = {
            deletedAt: null,
            ...(params.search?.trim()
                ? {
                    OR: [
                        { firstName: { contains: params.search } },
                        { lastName: { contains: params.search } },
                        { alias: { contains: params.search } },
                        { phone: { contains: params.search } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.colaborador.findMany({
                skip,
                take,
                where,
                orderBy: {
                    [sortField]: sortOrder,
                } as Prisma.ColaboradorOrderByWithRelationInput,
            }),
            this.prisma.colaborador.count({ where }),
        ]);

        return { items, total };
    }

    async findOne(id: string) {
        const item = await this.prisma.colaborador.findFirst({
            where: { id, deletedAt: null },
        });

        if (!item) {
            throw new NotFoundException('Colaborador no encontrado');
        }

        return item;
    }

    async update(id: string, dto: UpdateColaboradorDto) {
        await this.findOne(id);

        return this.prisma.colaborador.update({
            where: { id },
            data: {
                ...dto,
            },
        });
    }

    async remove(id: string, reason?: string) {
        await this.findOne(id);

        return this.prisma.colaborador.update({
            where: { id },
            data: {
                active: false,
                deletedAt: this.nowIso(),
                deletedReason: reason,
            },
        });
    }
}