import { Module } from '@nestjs/common';
import { PagosPersonalService } from './pagos-personal.service';
import { PagosPersonalController } from './pagos-personal.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PagosPersonalController],
  providers: [PagosPersonalService],
})
export class PagosPersonalModule { }