import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProdhtDto {
  @IsNotEmpty()
  @IsString()
  hashtag!: string;
}