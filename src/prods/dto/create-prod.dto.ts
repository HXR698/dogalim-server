import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional, IsBoolean, Min, IsUrl } from 'class-validator';

export class CreateProdDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0, { message: 'Fiyat 0 dan küçük olamaz.' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Stok 0 dan küçük olamaz.' })
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir görsel URL adresi giriniz.' })
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsInt()
  @Min(0, { message: 'Hazırlanma süresi negatif olamaz.' })
  prepare_time: number;
}
