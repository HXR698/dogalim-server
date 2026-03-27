import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsEmail()
  mail_adr!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  user_name!: string;
}