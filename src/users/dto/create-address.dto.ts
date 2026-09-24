import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Adres başlığı boş olamaz (Örn: Ev, İş).' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Açık adres / bina detayları boş olamaz.' })
  address: string;

  @IsNumber({}, { message: 'Enlem (latitude) geçerli bir sayı olmalıdır.' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber({}, { message: 'Boylam (longitude) geçerli bir sayı olmalıdır.' })
  @Min(-180)
  @Max(180)
  longitude: number;
}
