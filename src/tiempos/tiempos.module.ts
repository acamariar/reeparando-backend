import { Module } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { TiemposController } from './tiempos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiemposController],
  providers: [TiemposService],
})
export class TiemposModule { }
