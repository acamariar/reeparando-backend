import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PanelController } from './panel.controller';
import { PanelService } from './panel.service';


@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [PanelController],
    providers: [PanelService],
})
export class PanelModule { }