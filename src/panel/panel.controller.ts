import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { PanelService } from './panel.service';


@ApiTags('panel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('panel')
export class PanelController {
    constructor(private readonly panelService: PanelService) { }

    @Get('resumen')
    @ApiQuery({
        name: 'date',
        required: false,
        type: String,
        example: '2026-08-10',
    })
    getResumen(@Query('date') date?: string) {
        return this.panelService.getResumen(date);
    }
}