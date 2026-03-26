import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateHashtagDto {
  @IsNotEmpty()
  @IsString()
  hashtag!: string;
}