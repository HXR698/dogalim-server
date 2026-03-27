import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSellerDto {
  @IsNotEmpty()
  @IsString()
  user_name!: string;

  @IsNotEmpty()
  @IsEmail()
  mail_adr!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  hashtags?: string[];

  @IsNotEmpty()
  @IsString()
  explanation!: string;
}