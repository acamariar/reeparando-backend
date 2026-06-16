import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCompraEmpresaDto {
    @ApiProperty({ description: 'yyyy-mm-dd' })
    @IsString()
    date!: string;

    @ApiProperty()
    @IsString()
    concept!: string;

    @ApiProperty()
    @IsString()
    category!: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    amount!: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    provider?: string;

    @ApiProperty({ example: 'FAC-000123' })
    @IsString()
    invoiceRef!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    createdAt?: string;
}