import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';

@Injectable()
export class TiemposService {
  constructor(private prisma: PrismaService) { }

  // Crear tiempo y sumar amount al saldoActual del empleado
  async create(dto: CreateTiempoDto) {
    const [tiempo] = await this.prisma.$transaction([
      this.prisma.tiempo.create({ data: dto }),
      this.prisma.empleado.update({
        where: { id: dto.employeeId },
        data: { saldoActual: { increment: dto.amount } },
      }),
    ]);
    return tiempo;
  }

  async findAll(params: {
    projectId?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.limit ?? 10);
    const skip = (page - 1) * take;
    const sortField = params.sort ?? 'date';
    const sortOrder = params.order ?? 'desc';

    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    if (params.employeeId) where.employeeId = params.employeeId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tiempo.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.tiempo.count({ where }),
    ]);

    return { items, total };
  }

  findOne(id: string) {
    return this.prisma.tiempo.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTiempoDto) {
    return this.prisma.tiempo.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.tiempo.delete({ where: { id } });
  }
}
