import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateClienteDto) {
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
  }) {
    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.limit ?? 10);
    const skip = (page - 1) * take;
    const sortField = params.sort ?? 'lastName';
    const sortOrder = params.order ?? 'asc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.cliente.count(),
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
