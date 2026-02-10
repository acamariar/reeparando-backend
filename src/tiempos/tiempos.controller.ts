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
  BadRequestException,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TiemposService } from './tiempos.service';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';

@ApiTags('tiempos')
@Controller('tiempos')
export class TiemposController {
  constructor(private readonly tiemposService: TiemposService) { }

  @Post()
  create(@Body() dto: CreateTiempoDto) {
    return this.tiemposService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({ name: '_page', required: false, type: Number })
  @ApiQuery({ name: '_limit', required: false, type: Number })
  @ApiQuery({ name: '_sort', required: false, type: String })
  @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('projectId') projectId: string,
    @Query('employeeId') employeeId: string,
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

    const { items, total } = await this.tiemposService.findAll({
      projectId,
      employeeId,
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
    return this.tiemposService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTiempoDto) {
    return this.tiemposService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiemposService.remove(id);
  }
}

