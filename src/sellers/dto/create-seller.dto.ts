import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  storename: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

