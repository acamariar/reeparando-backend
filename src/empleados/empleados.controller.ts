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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@ApiTags('personal')
@Controller('personal') // coincide con tu slice
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) { }

  @Post()
  create(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.create(dto);
  }

  @Get()
  @ApiQuery({ name: '_page', required: false, type: Number })
  @ApiQuery({ name: '_limit', required: false, type: Number })
  @ApiQuery({ name: '_sort', required: false, type: String })
  @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
  async findAll(
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

    const { items, total } = await this.empleadosService.findAll({
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
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpleadoDto) {
    return this.empleadosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
}

