import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoPersonalDto } from './dto/create-pagos-personal.dto';
import { UpdatePagoPersonalDto } from './dto/update-pagos-personal.dto';
import { Prisma } from '@prisma/client';

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

  async update(id: string, dto: UpdatePagoPersonalDto) {
    return this.prisma.$transaction(async (tx) => {
      const prev = await tx.pagoPersonal.findUnique({ where: { id } });
      if (!prev) throw new BadRequestException('Pago no encontrado');

      const delta = (dto.amount ?? prev.amount) - prev.amount;
      // delta > 0: pagas más → saldo baja; delta < 0: saldo sube
      await tx.empleado.update({
        where: { id: prev.employeeId },
        data: { saldoActual: { decrement: delta } },
      });

      return tx.pagoPersonal.update({ where: { id }, data: dto });
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const pago = await tx.pagoPersonal.findUnique({ where: { id } });
      if (!pago) throw new BadRequestException('Pago no encontrado');

      // Revertir el efecto del pago
      await tx.empleado.update({
        where: { id: pago.employeeId },
        data: { saldoActual: { increment: pago.amount } },
      });

      return tx.pagoPersonal.delete({ where: { id } });
    });
  }
  async findAll({ where = {}, page = 1, limit = 10, sort = 'date', order = 'desc', search,
    from,
    to, }) {
    const skip = (page - 1) * limit;
    let employeeIds: string[] | undefined;
    if (search) {
      const emps = await this.prisma.empleado.findMany({
        where: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      employeeIds = emps.map(e => e.id);
    }


    const whereFilter: Prisma.PagoPersonalWhereInput = {
      ...(employeeIds?.length ? { employeeId: { in: employeeIds } } : {}),
      ...(from || to
        ? {
          date: {
            ...(from ? { gte: from } : {}), // si date es String (YYYY-MM-DD)
            ...(to ? { lte: to } : {}),
          },
        }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.pagoPersonal.findMany({
        where: whereFilter,
        skip,
        take: limit,
        orderBy: { [sort]: order },

      }),
      this.prisma.pagoPersonal.count({ where: whereFilter }),
    ]);
    return { items, total };
  }

}
