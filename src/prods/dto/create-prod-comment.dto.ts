import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProdCommDto {
  @IsInt()
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(5, { message: 'Puan en fazla 5 olmalıdır.' })
  @IsNotEmpty({ message: 'Puan alanı boş bırakılamaz.' })
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
