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
import { ColaboradoresService } from './colaboradores.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@ApiTags('colaboradores')
@Controller('colaboradores')
export class ColaboradoresController {
    constructor(private readonly colaboradoresService: ColaboradoresService) { }

    @Post()
    create(@Body() dto: CreateColaboradorDto) {
        return this.colaboradoresService.create(dto);
    }

    @Get()
    @ApiQuery({ name: '_page', required: false, type: Number })
    @ApiQuery({ name: '_limit', required: false, type: Number })
    @ApiQuery({ name: '_sort', required: false, type: String })
    @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    async findAll(
        @Query('_page') _page = '1',
        @Query('_limit') _limit = '10',
        @Query('_sort') _sort = 'lastName',
        @Query('_order') _order: 'asc' | 'desc' = 'asc',
        @Query('search') search?: string,
        @Res() res?: Response,
    ) {
        const { items, total } = await this.colaboradoresService.findAll({
            page: Number(_page) || 1,
            limit: Number(_limit) || 10,
            sort: _sort,
            order: _order,
            search,
        });

        res?.set('x-total-count', total.toString());
        return res?.json(items);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.colaboradoresService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateColaboradorDto) {
        return this.colaboradoresService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('reason') reason?: string) {
        return this.colaboradoresService.remove(id, reason);
    }
}