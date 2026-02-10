import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoProyectoDto } from './create-gastos-proyecto.dto';


export class UpdateGastosProyectoDto extends PartialType(CreateGastoProyectoDto) { }
