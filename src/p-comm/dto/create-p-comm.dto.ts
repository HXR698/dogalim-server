import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreatePCommDto {

  @IsInt()
  productId!: number;
  
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  evaluation!: number;
}
