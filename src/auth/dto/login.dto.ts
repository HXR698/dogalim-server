import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty({ message: 'E-posta boş olamaz.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre boş olamaz.' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
  password: string;
}
