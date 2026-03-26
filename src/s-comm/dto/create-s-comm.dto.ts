import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreateSCommDto {

  @IsInt()
  sellerId!: number;
  
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  evaluation!: number;
}
