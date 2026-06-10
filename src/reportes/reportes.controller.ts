import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';

@ApiTags('reportes')
@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    @Get('ganancias')
    @ApiQuery({ name: 'from', required: true, type: String, example: '2026-09-20' })
    @ApiQuery({ name: 'to', required: true, type: String, example: '2026-10-20' })
    getGanancias(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        if (!from || !to) {
            throw new BadRequestException('from y to son obligatorios');
        }

        return this.reportesService.getGanancias(from, to);
    }
}