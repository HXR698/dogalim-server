import { IsInt, IsString, IsOptional, IsDate, Length } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsString()
  @Length(64, 64)
  refreshToken!: string;

  @IsString()
  @Length(1, 128)
  deviceid!: string;

  @IsOptional()
  @IsString()
  ipadress?: string;

  @IsOptional()
  @IsString()
  useragent?: string;

  @IsDate()
  expiresat!: Date;
}

export class CreateSellerRefreshTokenDto {
  @IsString()
  @Length(64, 64)
  refreshToken!: string;

  @IsInt()
  userid!: number;

  @IsString()
  @Length(1, 128)
  deviceid!: string;

  @IsOptional()
  @IsString()
  ipadress?: string;

  @IsOptional()
  @IsString()
  selleragent?: string;

  @IsDate()
  expiresat!: Date;
}
