import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateColaboradorDto implements Prisma.ColaboradorCreateInput {
    @ApiProperty()
    @IsString()
    firstName!: string;

    @ApiProperty()
    @IsString()
    lastName!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    createdAt?: string;
}