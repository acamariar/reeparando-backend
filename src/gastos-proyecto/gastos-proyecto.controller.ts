import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GastosProyectoService } from './gastos-proyecto.service';
import { UpdateGastosProyectoDto } from './dto/update-gastos-proyecto.dto';
import { CreateGastoProyectoDto } from './dto/create-gastos-proyecto.dto';

@ApiTags('gastosProyecto')
@Controller('gastosProyecto')
export class GastosProyectoController {
  constructor(private readonly gastosService: GastosProyectoService) { }

  @Post()
  create(@Body() dto: CreateGastoProyectoDto) {
    return this.gastosService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: '_page', required: false, type: Number })
  @ApiQuery({ name: '_limit', required: false, type: Number })
  @ApiQuery({ name: '_sort', required: false, type: String })
  @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('projectId') projectId: string,
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

    const { items, total } = await this.gastosService.findAll({
      projectId,
      page,
      limit,
      sort,
      order,
    });

    res.set('x-total-count', total.toString());
    return res.json(items);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGastosProyectoDto) {
    return this.gastosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastosService.remove(id);
  }
}
