import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateTiempoDto implements Prisma.TiempoCreateInput {
    @ApiProperty()
    @IsString()
    projectId: string;

    @ApiProperty()
    @IsString()
    employeeId: string;

    @ApiProperty({ description: 'yyyy-mm-dd' })
    @IsString()
    date: string;

    @ApiProperty()
    @IsNumber()
    hours: number;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
