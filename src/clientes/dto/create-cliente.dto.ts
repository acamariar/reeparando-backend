import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateClienteDto implements Prisma.ClienteCreateInput {
    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

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
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zip?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    dni?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    createdAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referenceMedium?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    generatedSale?: string;

}
