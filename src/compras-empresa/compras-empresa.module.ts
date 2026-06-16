import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComprasEmpresaController } from './compras-empresa.controller';
import { ComprasEmpresaService } from './compras-empresa.service';

@Module({
    imports: [PrismaModule],
    controllers: [ComprasEmpresaController],
    providers: [ComprasEmpresaService],
})
export class ComprasEmpresaModule { }