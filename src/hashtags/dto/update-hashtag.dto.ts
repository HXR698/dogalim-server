import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateHashtagDto {
  @IsOptional()
  @IsString()
  hashtag?: string;
}