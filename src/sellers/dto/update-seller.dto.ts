import { IsEmail, IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsEmail()
  mail_adr?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  hashtags?: string[];

  @IsOptional()
  @IsString()
  explanation?: string;
}