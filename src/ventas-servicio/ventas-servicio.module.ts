import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VentasServicioController } from './ventas-servicio.controller';
import { VentasServicioService } from './ventas-servicio.service';

@Module({
    imports: [PrismaModule],
    controllers: [VentasServicioController],
    providers: [VentasServicioService],
})
export class VentasServicioModule { }