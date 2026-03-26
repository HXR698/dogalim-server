import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ArrayMaxSize, ArrayUnique, Min } from 'class-validator';

export class CreateProductDto {

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(16, { message: 'Maximum 16 hashtags allowed' })
  @ArrayUnique()
  @IsString({ each: true })
  hashtags?: string[];
}