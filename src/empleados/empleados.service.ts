import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({
      data: {
        ...dto,
        status: dto.status ?? 'activo',
        saldoActual: dto.saldoActual ?? 0,
        startDate: dto.startDate ?? new Date().toISOString().slice(0, 10),
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
      this.prisma.empleado.findMany({
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.empleado.count(),
    ]);

    return { items, total };
  }

  findOne(id: string) {
    return this.prisma.empleado.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEmpleadoDto) {
    return this.prisma.empleado.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.empleado.delete({ where: { id } });
  }
}
