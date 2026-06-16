import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { MetodoCobroServicio } from '@prisma/client';

export class CreateVentaServicioDto {
    @ApiProperty({ description: 'yyyy-mm-dd' })
    @IsString()
    date!: string;

    @ApiProperty()
    @IsString()
    description!: string;

    @ApiProperty({ example: 'VT0568' })
    @IsString()
    serviceCode!: string;

    @ApiProperty()
    @IsString()
    serviceType!: string;

    @ApiProperty({ enum: MetodoCobroServicio })
    @IsEnum(MetodoCobroServicio)
    paymentMethod!: MetodoCobroServicio;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    collaboratorId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    clientId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    clientName?: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    amount!: number;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    commissionPercent?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    createdAt?: string;
}