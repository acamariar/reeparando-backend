import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateEmpleadoDto implements Prisma.EmpleadoCreateInput {
    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

    @ApiProperty({ required: false, description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    birthDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    addressProof?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    criminalRecord?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    emergencyContactName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    emergencyContactPhone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cbu?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    specialty?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    coverageAreas?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    availability?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shirtSize?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shoeSize?: string;

    @ApiProperty({ required: false, default: 'activo' })
    @IsOptional()
    @IsString()
    status?: string

    @ApiProperty({ description: 'yyyy-mm-dd', required: false })
    @IsString()
    startDate: string;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    saldoActual: number;
}
