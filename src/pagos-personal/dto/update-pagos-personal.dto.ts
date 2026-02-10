import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoPersonalDto } from './create-pagos-personal.dto';


export class UpdatePagoPersonalDto extends PartialType(CreatePagoPersonalDto) { }
