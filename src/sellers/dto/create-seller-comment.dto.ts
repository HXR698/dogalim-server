import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSellerCommentDto {
  @IsInt({ message: 'Değerlendirme puanı tam sayı olmalıdır.' })
  @IsNotEmpty({ message: 'Puan alanı boş olamaz.' })
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(5, { message: 'Puan en fazla 5 olmalıdır.' })
  @Type(() => Number) // HTTP üzerinden gelen string sayı değerini integer'a çevirmek için
  rating: number;

  @IsString({ message: 'Yorum metni geçerli bir metin olmalıdır.' })
  @IsOptional()
  @Length(2, 500, { message: 'Yorum en az 2, en fazla 500 karakter olabilir.' })
  comment?: string;
}
