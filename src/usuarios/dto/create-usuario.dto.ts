// src/usuarios/dto/create-usuario.dto.ts
import { Prisma } from '@prisma/client';
import { IsInt, IsString } from 'class-validator';

export class CreateUsuarioDto implements Prisma.UsuarioCreateInput {
    @IsString()
    usuario: string;

    @IsString()
    clave: string;

    @IsInt()
    nivel: number;
}
