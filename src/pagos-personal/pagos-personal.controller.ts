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
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: '_page', required: false, type: Number })
  @ApiQuery({ name: '_limit', required: false, type: Number })
  @ApiQuery({ name: '_sort', required: false, type: String })
  @ApiQuery({ name: '_order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  async findAll(
    @Query('employeeId') employeeId: string,
    @Query('projectId') projectId: string,
    @Query('_page') _page = 1,
    @Query('_limit') _limit = 10,
    @Query('_sort') _sort = 'date',
    @Query('_order') _order: 'asc' | 'desc' = 'desc',
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const page = Number(_page) || 1;
    const limit = Number(_limit) || 10;
    const sort = _sort || 'date';
    const order = _order || 'desc';

    const { items, total } = await this.pagosService.findAll({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(projectId ? { projectId } : {}),
      },
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


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePagoPersonalDto) {
    return this.pagosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(id);
  }
}
