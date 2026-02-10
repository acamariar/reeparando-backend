import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoPersonalDto } from './dto/create-pagos-personal.dto';
import { UpdatePagoPersonalDto } from './dto/update-pagos-personal.dto';


@Injectable()
export class PagosPersonalService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreatePagoPersonalDto) {
    // Transacción: crear pago y restar saldo del empleado
    const [pago] = await this.prisma.$transaction([
      this.prisma.pagoPersonal.create({ data: dto }),
      this.prisma.empleado.update({
        where: { id: dto.employeeId },
        data: { saldoActual: { decrement: dto.amount } },
      }),
    ]);
    return pago;
  }

  async findByEmployee(params: {
    employeeId: string;
    projectId?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const { employeeId, projectId } = params;
    if (!employeeId) throw new BadRequestException('employeeId is required');

    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.limit ?? 10);
    const skip = (page - 1) * take;
    const sortField = params.sort ?? 'date';
    const sortOrder = params.order ?? 'desc';

    const where: any = { employeeId };
    if (projectId) where.projectId = projectId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.pagoPersonal.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.pagoPersonal.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, dto: UpdatePagoPersonalDto) {
    return this.prisma.pagoPersonal.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.pagoPersonal.delete({ where: { id } });
  }
}
