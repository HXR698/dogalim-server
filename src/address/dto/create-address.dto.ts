import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  district!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  addressLine!: string;
}