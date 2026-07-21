import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SeguimientoComisionService } from './seguimiento-comision.service';
import { CreateSeguimientoComisionDto } from './dto/create-seguimiento-comision.dto';
import { UpdateSeguimientoComisionDto } from './dto/update-seguimiento-comision.dto';

@ApiTags('seguimiento-comision')
@Controller('seguimiento-comision')
export class SeguimientoComisionController {
    constructor(private readonly service: SeguimientoComisionService) { }

    @Post()
    create(@Body() dto: CreateSeguimientoComisionDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'seguimientoId', required: false, type: String })
    @ApiQuery({ name: 'colaboradorId', required: false, type: String })
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('search') search: string,
        @Query('seguimientoId') seguimientoId: string,
        @Query('colaboradorId') colaboradorId: string,
        @Res() res: Response,
    ) {
        const { items, total } = await this.service.findAll({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search,
            seguimientoId,
            colaboradorId,
        });

        res.set('x-total-count', total.toString());
        return res.json(items);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSeguimientoComisionDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}