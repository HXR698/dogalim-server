import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerCommentDto } from './create-seller-comment.dto';

export class UpdateSellerCommentDto extends PartialType(CreateSellerCommentDto) { }

