import { IsInt } from 'class-validator';

export class CreateLikedProdsDto {
  @IsInt()
  productId!: number;
}