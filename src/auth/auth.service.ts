import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './types/jwt-payload/jwt-payload';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

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

        const payload: JwtPayload = {
            sub: user.id,
            usuario: user.usuario,
            nivel: user.nivel,
            passwordSet: user.passwordSet,
        };

        const token = this.jwtService.sign(payload);

        const { clave: _clave, ...safeUser } = user;

        return {
            accessToken: token,
            user: safeUser,
            passwordSet: user.passwordSet,
        };
    }
}