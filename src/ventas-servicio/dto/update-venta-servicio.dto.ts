import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaServicioDto } from './create-venta-servicio.dto';

export class UpdateVentaServicioDto extends PartialType(CreateVentaServicioDto) { }