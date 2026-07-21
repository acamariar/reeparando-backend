import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { MetodoCobroServicio } from '@prisma/client';

export class FinalizarSeguimientoDto {
    @ApiPropertyOptional({ enum: MetodoCobroServicio })
    @IsEnum(MetodoCobroServicio)
    paymentMethod!: MetodoCobroServicio;

    @ApiPropertyOptional({ default: 0 })
    @Type(() => Number)
    @IsNumber()
    montoPagadoCliente!: number;

    @ApiPropertyOptional({ default: 0 })
    @Type(() => Number)
    @IsNumber()
    montoColaborador!: number;

    @ApiPropertyOptional({ default: 0 })
    @Type(() => Number)
    @IsNumber()
    montoReeparando!: number;

    @ApiPropertyOptional({ description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    fechaLimiteGarantia?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    observacionesCliente?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    observacionesTecnicas?: string;

    @ApiPropertyOptional({ description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    fechaFinalizacion?: string;
}
