import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateProyectoDto implements Prisma.ProyectoCreateInput {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false, description: 'cliente libre, no FK' })
    @IsOptional()
    @IsString()
    client: string;          // lo guardaremos en clientId

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false, default: 'En Progreso' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ required: false, default: 'impermeabilizacion' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    budget?: number;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    progress?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    dueDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    team?: string[];
}
