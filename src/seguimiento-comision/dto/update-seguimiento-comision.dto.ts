import { PartialType } from '@nestjs/swagger';
import { CreateSeguimientoComisionDto } from './create-seguimiento-comision.dto';


export class UpdateSeguimientoComisionDto extends PartialType(CreateSeguimientoComisionDto) { }