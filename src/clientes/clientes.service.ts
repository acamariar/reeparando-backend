import { Injectable, BadRequestException, ConflictException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateClienteDto) {
    const phone = dto.phone.trim();
    const exists = await this.prisma.cliente.findFirst({
      where: { phone },
    });

    if (exists) {
      throw new ConflictException('Ya existe un cliente con ese teléfono');
    }

    return this.prisma.cliente.create({
      data: {
        ...dto,
        createdAt: dto.createdAt ?? new Date().toISOString().slice(0, 10),
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
    const where: Prisma.ClienteWhereInput = params.search
      ? {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ],
      }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        skip,
        take,
        where,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return { items, total };
  }

  findOne(id: string) {
    return this.prisma.cliente.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateClienteDto) {
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.cliente.delete({ where: { id } });
  }
}
