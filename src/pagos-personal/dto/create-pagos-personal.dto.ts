import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreatePagoPersonalDto implements Prisma.PagoPersonalCreateInput {
    @ApiProperty()
    @IsString()
    employeeId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    projectId?: string;

    @ApiProperty({ description: 'yyyy-mm-dd' })
    @IsString()
    date: string;

    @ApiProperty({ enum: ['pago', 'adelanto'] })
    @IsIn(['pago', 'adelanto'])
    type: string;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
