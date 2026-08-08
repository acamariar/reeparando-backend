import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import {
    EstadoSeguimiento,
    OrigenClienteSeguimiento,
    TipoVisitaSeguimiento,
} from '@prisma/client';

export class CreateSeguimientoDto {
    @ApiProperty({ example: 'VT0701' })
    @IsString()
    numeroVisita!: string;

    @ApiProperty({ example: 'cliente_id' })
    @IsMongoId()
    clientId!: string;

    @ApiProperty({ example: 'Av. Rivadavia 1234' })
    @IsString()
    direccionServicio!: string;

    @ApiProperty({ enum: TipoVisitaSeguimiento })
    @IsEnum(TipoVisitaSeguimiento)
    tipoVisita!: TipoVisitaSeguimiento;

    @ApiPropertyOptional({ example: 'Caballito' })
    @IsOptional()
    @IsString()
    zona?: string;


    @ApiProperty({ description: 'yyyy-mm-dd', example: '2026-07-08' })
    @IsString()
    fechaSolicitud!: string;

    @ApiPropertyOptional({ description: 'yyyy-mm-dd', example: '2026-07-10' })
    @IsOptional()
    @IsString()
    fechaVisita?: string;


    @ApiPropertyOptional({ description: 'hh:mm', example: '14:30' })
    @IsOptional()
    @IsString()
    horaVisita?: string;

    @ApiPropertyOptional({ example: 'colaborador_id' })
    @IsOptional()
    @IsMongoId()
    colaboradorId!: string;

    @ApiProperty({ example: 'Cambio de grifería' })
    @IsString()
    servicioRequerido!: string;

    @ApiPropertyOptional({ example: 'Plomería' })
    @IsOptional()
    @IsString()
    tipoServicio?: string;

    @ApiProperty({ enum: OrigenClienteSeguimiento })
    @IsEnum(OrigenClienteSeguimiento)
    origenCliente!: OrigenClienteSeguimiento;

    @ApiPropertyOptional({ enum: EstadoSeguimiento })
    @IsOptional()
    @IsEnum(EstadoSeguimiento)
    estado?: EstadoSeguimiento;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    montoPresupuestado?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    montoPagadoCliente?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    montoColaborador?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    montoReeparando?: number;

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
