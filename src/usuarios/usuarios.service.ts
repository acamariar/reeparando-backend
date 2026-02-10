import { Injectable, Module } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],   // <- necesario
})

export class PrismaModule { }

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) { }

  findAll(usuario?: string, clave?: string) {
    if (usuario && clave) {
      return this.prisma.usuario.findMany({
        where: { usuario, clave },
      });
    }
    return this.prisma.usuario.findMany();
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  create(dto: CreateUsuarioDto) {
    return this.prisma.usuario.create({ data: dto });
  }

  update(id: string, dto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}