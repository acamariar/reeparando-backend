import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

type PrismaProyecto = Awaited<ReturnType<PrismaService['proyecto']['findFirst']>>;

@Injectable()
export class ProyectosService {
  constructor(private prisma: PrismaService) { }

  private mapProyecto(p: PrismaProyecto) {
    if (!p) return p;
    return { ...p, team: p.team ?? [] };
  }
  async create(dto: CreateProyectoDto) {
    const created = await this.prisma.proyecto.create({
      data: {
        name: dto.name,
        client: dto.client, // guardamos client en clientId
        address: dto.address,
        status: dto.status ?? 'En Progreso',
        category: dto.category ?? 'impermeabilizacion',
        budget: dto.budget ?? 0,
        progress: dto.progress ?? 0,
        dueDate: dto.dueDate,
        description: dto.description,
        team: dto.team ?? [],
      },
    });
    return this.mapProyecto(created);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.limit ?? 6);
    const skip = (page - 1) * take;
    const sortField = params.sort ?? 'id';
    const sortOrder = params.order ?? 'desc';

    const [items, total] = await Promise.all([
      this.prisma.proyecto.findMany({
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
      }),
      this.prisma.proyecto.count(),
    ]);

    return { items: items.map((p) => this.mapProyecto(p)), total };
  }

  async findOne(id: string) {
    const p = await this.prisma.proyecto.findUnique({ where: { id } });
    return this.mapProyecto(p);
  }

  async update(id: string, dto: UpdateProyectoDto) {
    const updated = await this.prisma.proyecto.update({
      where: { id },
      data: {
        name: dto.name,
        client: dto.client,
        address: dto.address,
        status: dto.status,
        category: dto.category,
        budget: dto.budget,
        progress: dto.progress,
        dueDate: dto.dueDate,
        description: dto.description,
        team: dto.team ? { set: dto.team } : undefined,
      },
    });
    return this.mapProyecto(updated);
  }

  remove(id: string) {
    return this.prisma.proyecto.delete({ where: { id } });
  }
}
