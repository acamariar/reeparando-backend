import { Injectable, Module } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';


@Module({
  providers: [PrismaService],
  exports: [PrismaService],   // <- necesario
})

export class PrismaModule { }

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) { }

  findAll(usuario?: string) {
    if (usuario) {
      return this.prisma.usuario.findMany({
        where: { usuario },
      });
    }
    return this.prisma.usuario.findMany();
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async create(dto: CreateUsuarioDto) {
    const hash = await bcrypt.hash(dto.clave, 10);

    return this.prisma.usuario.create({
      data: {
        usuario: dto.usuario,
        clave: hash,
        nivel: dto.nivel,
        passwordSet: false,
      },
    });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const data: any = { ...dto };

    if (dto.clave) {
      data.clave = await bcrypt.hash(dto.clave, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }

  async login(usuario: string, clave: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { usuario },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const ok = await bcrypt.compare(clave, user.clave);

    if (!ok) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const { clave: _clave, ...safeUser } = user;

    return {
      user: safeUser,
      passwordSet: user.passwordSet,
    };
  }
}
