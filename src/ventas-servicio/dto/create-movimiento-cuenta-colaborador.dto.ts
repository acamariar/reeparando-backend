import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { DireccionCuentaColaborador, TipoMovimientoColaborador } from '@prisma/client';

export class CreateMovimientoCuentaColaboradorDto {
    @ApiProperty()
    @IsString()
    collaboratorId!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    saleId?: string;

    @ApiProperty({ enum: TipoMovimientoColaborador })
    @IsEnum(TipoMovimientoColaborador)
    type!: TipoMovimientoColaborador;

    @ApiProperty({ enum: DireccionCuentaColaborador })
    @IsEnum(DireccionCuentaColaborador)
    direction!: DireccionCuentaColaborador;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    amount!: number;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    paidAmount?: number;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pendingAmount?: number;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    paidAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}