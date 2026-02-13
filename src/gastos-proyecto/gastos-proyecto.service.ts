import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGastosProyectoDto } from './dto/update-gastos-proyecto.dto';
import { CreateGastoProyectoDto } from './dto/create-gastos-proyecto.dto';

@Injectable()
export class GastosProyectoService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateGastoProyectoDto) {
    if (dto.invoiceRef) {
      const exists = await this.prisma.gastoProyecto.findFirst({
        where: {
          invoiceRef: dto.invoiceRef,

        },
      });
      if (exists) throw new BadRequestException('Ese número de factura ya existe');
    }
    return this.prisma.gastoProyecto.create({ data: dto });
  }

  async findAll(params: {
    projectId?: string;
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.gastoProyecto.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.gastoProyecto.count({ where }),
    ]);

    return { items, total };
  }

  findOne(id: string) {
    return this.prisma.gastoProyecto.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateGastosProyectoDto) {
    if (dto.invoiceRef) {
      const exists = await this.prisma.gastoProyecto.findFirst({
        where: {
          invoiceRef: dto.invoiceRef,
          // si es por proyecto:
          // projectId: dto.projectId,
          NOT: { id },
        },
      });
      if (exists) throw new BadRequestException('Ese número de factura ya existe');
    }
    return this.prisma.gastoProyecto.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.gastoProyecto.delete({ where: { id } });
  }
}
