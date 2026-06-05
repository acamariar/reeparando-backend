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
import { VentasServicioService } from './ventas-servicio.service';
import { CreateVentaServicioDto } from './dto/create-venta-servicio.dto';
import { UpdateVentaServicioDto } from './dto/update-venta-servicio.dto';
import { CreateMovimientoCuentaColaboradorDto } from './dto/create-movimiento-cuenta-colaborador.dto';
import { UpdateMovimientoCuentaColaboradorDto } from './dto/update-movimiento-cuenta-colaborador.dto';

@ApiTags('ventas-servicio')
@Controller('ventas-servicio')
export class VentasServicioController {
    constructor(private readonly ventasService: VentasServicioService) { }

    // Ventas

    @Post()
    createSale(@Body() dto: CreateVentaServicioDto) {
        return this.ventasService.createSale(dto);
    }

    @Get()
    @ApiQuery({ name: '_page', required: false, type: Number })
    @ApiQuery({ name: '_limit', required: false, type: Number })
    @ApiQuery({ name: '_sort', required: false, type: String })
    @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    async findAllSales(
        @Query('_page') _page = '1',
        @Query('_limit') _limit = '10',
        @Query('_sort') _sort = 'date',
        @Query('_order') _order: 'asc' | 'desc' = 'desc',
        @Query('search') search?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Res() res?: Response,
    ) {
        const { items, total } = await this.ventasService.findAllSales({
            page: Number(_page) || 1,
            limit: Number(_limit) || 10,
            sort: _sort,
            order: _order,
            search,
            from,
            to,
        });

        res?.set('x-total-count', total.toString());
        return res?.json(items);
    }

    @Get(':id')
    findOneSale(@Param('id') id: string) {
        return this.ventasService.findOneSale(id);
    }

    @Patch(':id')
    updateSale(@Param('id') id: string, @Body() dto: UpdateVentaServicioDto) {
        return this.ventasService.updateSale(id, dto);
    }

    @Delete(':id')
    removeSale(@Param('id') id: string, @Query('reason') reason?: string) {
        return this.ventasService.removeSale(id, reason);
    }

    // Movimientos

    @Post('movimientos')
    createMovement(@Body() dto: CreateMovimientoCuentaColaboradorDto) {
        return this.ventasService.createMovement(dto);
    }

    @Get('movimientos')
    @ApiQuery({ name: 'collaboratorId', required: false, type: String })
    @ApiQuery({ name: 'saleId', required: false, type: String })
    @ApiQuery({ name: '_page', required: false, type: Number })
    @ApiQuery({ name: '_limit', required: false, type: Number })
    async findAllMovements(
        @Query('collaboratorId') collaboratorId?: string,
        @Query('saleId') saleId?: string,
        @Query('_page') _page = '1',
        @Query('_limit') _limit = '10',
        @Res() res?: Response,
    ) {
        const { items, total } = await this.ventasService.findAllMovements({
            collaboratorId,
            saleId,
            page: Number(_page) || 1,
            limit: Number(_limit) || 10,
        });

        res?.set('x-total-count', total.toString());
        return res?.json(items);
    }

    @Get('movimientos/:id')
    findOneMovement(@Param('id') id: string) {
        return this.ventasService.findOneMovement(id);
    }

    @Patch('movimientos/:id')
    updateMovement(
        @Param('id') id: string,
        @Body() dto: UpdateMovimientoCuentaColaboradorDto,
    ) {
        return this.ventasService.updateMovement(id, dto);
    }

    @Delete('movimientos/:id')
    removeMovement(@Param('id') id: string) {
        return this.ventasService.removeMovement(id);
    }
}