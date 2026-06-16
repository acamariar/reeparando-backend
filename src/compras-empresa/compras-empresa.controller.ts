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
import { ComprasEmpresaService } from './compras-empresa.service';
import { CreateCompraEmpresaDto } from './dto/create-compra-empresa.dto';
import { UpdateCompraEmpresaDto } from './dto/update-compra-empresa.dto';

@ApiTags('comprasEmpresa')
@Controller('compras-empresa')
export class ComprasEmpresaController {
    constructor(private readonly comprasService: ComprasEmpresaService) { }

    @Post()
    create(@Body() dto: CreateCompraEmpresaDto) {
        return this.comprasService.create(dto);
    }

    @Get()
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @ApiQuery({ name: '_page', required: false, type: Number })
    @ApiQuery({ name: '_limit', required: false, type: Number })
    @ApiQuery({ name: '_sort', required: false, type: String })
    @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
    async findAll(
        @Query('search') search: string,
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('_page') _page: string,
        @Query('_limit') _limit: string,
        @Query('_sort') _sort: string,
        @Query('_order') _order: 'asc' | 'desc',
        @Res() res: Response,
    ) {
        const page = Number(_page) || 1;
        const limit = Number(_limit) || 10;
        const sort = _sort;
        const order = _order;

        const { items, total } = await this.comprasService.findAll({
            page,
            limit,
            sort,
            order,
            search,
            from,
            to,
        });

        res.set('x-total-count', total.toString());
        return res.json(items);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.comprasService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCompraEmpresaDto) {
        return this.comprasService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('reason') reason?: string) {
        return this.comprasService.remove(id, reason);
    }
}