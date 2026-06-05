import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVentaServicioComisionDto {
    @ApiProperty()
    @IsString()
    saleId!: string;

    @ApiProperty()
    @IsString()
    employeeId!: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    percentage!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    amount!: number;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    paidAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}