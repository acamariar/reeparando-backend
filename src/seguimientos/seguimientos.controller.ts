import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { EstadoSeguimiento, TipoVisitaSeguimiento } from '@prisma/client';
import { SeguimientosService } from './seguimientos.service';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { FinalizarSeguimientoDto } from './dto/finalizar-seguimiento.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('seguimientos')
@Controller('seguimientos')
export class SeguimientosController {
    constructor(private readonly seguimientosService: SeguimientosService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateSeguimientoDto, @Req() req: any) {
        return this.seguimientosService.create(dto, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'estado', required: false, enum: EstadoSeguimiento })
    @ApiQuery({ name: 'tipoVisita', required: false, enum: TipoVisitaSeguimiento })
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @ApiQuery({ name: '_page', required: false, type: Number })
    @ApiQuery({ name: '_limit', required: false, type: Number })
    @ApiQuery({ name: '_sort', required: false, type: String })
    @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
    async findAll(
        @Query('search') search: string,
        @Query('estado') estado: EstadoSeguimiento,
        @Query('tipoVisita') tipoVisita: TipoVisitaSeguimiento,
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

        const { items, total } = await this.seguimientosService.findAll({
            page,
            limit,
            sort,
            order,
            search,
            estado,
            tipoVisita,
            from,
            to,
        });

        res.set('x-total-count', total.toString());
        return res.json(items);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.seguimientosService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSeguimientoDto, @Req() req: any) {
        return this.seguimientosService.update(id, dto, req.user);
    }

    @Patch(':id/finalizar')
    @UseGuards(JwtAuthGuard)
    finalizar(@Param('id') id: string, @Body() dto: FinalizarSeguimientoDto, @Req() req: any) {
        return this.seguimientosService.finalizar(id, dto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('reason') reason?: string) {
        return this.seguimientosService.remove(id, reason);
    }
}