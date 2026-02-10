import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TiemposModule } from './tiempos/tiempos.module';
import { PagosPersonalModule } from './pagos-personal/pagos-personal.module';
import { GastosProyectoModule } from './gastos-proyecto/gastos-proyecto.module';
import { ClientesModule } from './clientes/clientes.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <- carga .env y lo expone en process.env
    PrismaModule,
    UsuariosModule,
    EmpleadosModule,
    ProyectosModule,
    TiemposModule,
    GastosProyectoModule,
    PagosPersonalModule,
    ClientesModule,
  ],
  providers: [AppService],
})
export class AppModule { }
