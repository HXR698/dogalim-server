import { PartialType } from '@nestjs/mapped-types';
import { CreateProdCommDto } from './create-prod-comment.dto';

export class UpdateProdCommDto extends PartialType(CreateProdCommDto) { }
