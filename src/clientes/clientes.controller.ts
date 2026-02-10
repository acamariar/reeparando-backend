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
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) { }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
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
    @Res() res,
  ) {
    const page = Number(_page) || 1;
    const limit = Number(_limit) || 10;
    const sort = _sort;
    const order = _order;

    const { items, total } = await this.clientesService.findAll({
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
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
