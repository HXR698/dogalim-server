import { PartialType } from '@nestjs/mapped-types';
import { CreateProdhtDto } from './create-prodht.dto';

export class UpdateProdhtDto extends PartialType(CreateProdhtDto) {}