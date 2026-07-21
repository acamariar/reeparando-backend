import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeguimientoComisionController } from './seguimiento-comision.controller';
import { SeguimientoComisionService } from './seguimiento-comision.service';

@Module({
    imports: [PrismaModule],
    controllers: [SeguimientoComisionController],
    providers: [SeguimientoComisionService],
})
export class SeguimientoComisionModule { }