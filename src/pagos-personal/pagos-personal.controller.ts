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
import { PagosPersonalService } from './pagos-personal.service';
import { CreatePagoPersonalDto } from './dto/create-pagos-personal.dto';
import { UpdatePagoPersonalDto } from './dto/update-pagos-personal.dto';

@ApiTags('pagosPersonal')
@Controller('pagosPersonal') // coincide con tu slice
export class PagosPersonalController {
  constructor(private readonly pagosService: PagosPersonalService) { }

  @Post()
  create(@Body() dto: CreatePagoPersonalDto) {
    return this.pagosService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'employeeId', required: true, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: '_page', required: false, type: Number })
  @ApiQuery({ name: '_limit', required: false, type: Number })
  @ApiQuery({ name: '_sort', required: false, type: String })
  @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('employeeId') employeeId: string,
    @Query('projectId') projectId: string,
    @Query('_page') _page: string,
    @Query('_limit') _limit: string,
    @Query('_sort') _sort: string,
    @Query('_order') _order: 'asc' | 'desc',
    @Res() res: Response,
  ) {
    if (!employeeId) throw new BadRequestException('employeeId is required');

    const page = Number(_page) || 1;
    const limit = Number(_limit) || 10;
    const sort = _sort;
    const order = _order;

    const { items, total } = await this.pagosService.findByEmployee({
      employeeId,
      projectId,
      page,
      limit,
      sort,
      order,
    });

    res.set('x-total-count', total.toString());
    return res.json(items);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePagoPersonalDto) {
    return this.pagosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(id);
  }
}
