import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaServicioComisionDto } from './create-venta-servicio-comision.dto';

export class UpdateVentaServicioComisionDto extends PartialType(CreateVentaServicioComisionDto) { }