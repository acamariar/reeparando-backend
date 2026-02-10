import { Module } from '@nestjs/common';
import { GastosProyectoService } from './gastos-proyecto.service';
import { GastosProyectoController } from './gastos-proyecto.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GastosProyectoController],
  providers: [GastosProyectoService],
})
export class GastosProyectoModule { }
