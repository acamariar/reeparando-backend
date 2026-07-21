import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSeguimientoComisionDto {
    @ApiProperty({ example: 'seguimiento_id' })
    @IsMongoId()
    seguimientoId!: string;

    @ApiProperty({ example: 'colaborador_id' })
    @IsMongoId()
    colaboradorId!: string;

    @ApiProperty({ example: 80 })
    @Type(() => Number)
    @IsNumber()
    percentage!: number;

    @ApiProperty({ example: 15000 })
    @Type(() => Number)
    @IsNumber()
    amount!: number;

    @ApiPropertyOptional({ description: 'yyyy-mm-dd' })
    @IsOptional()
    @IsString()
    paidAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}