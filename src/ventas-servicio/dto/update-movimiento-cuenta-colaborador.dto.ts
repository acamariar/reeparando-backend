import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoCuentaColaboradorDto } from './create-movimiento-cuenta-colaborador.dto';

export class UpdateMovimientoCuentaColaboradorDto extends PartialType(CreateMovimientoCuentaColaboradorDto) { }