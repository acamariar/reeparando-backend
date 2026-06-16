import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraEmpresaDto } from './create-compra-empresa.dto';

export class UpdateCompraEmpresaDto extends PartialType(CreateCompraEmpresaDto) { }