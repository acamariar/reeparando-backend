import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateGastoProyectoDto implements Prisma.GastoProyectoCreateInput {
    @ApiProperty()
    @IsString()
    projectId: string;

    @ApiProperty()
    @IsString()
    concept: string;

    @ApiProperty()
    @IsString()
    category: string;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'yyyy-mm-dd' })
    @IsString()
    date: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    supplier?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    invoiceRef?: string;
}
