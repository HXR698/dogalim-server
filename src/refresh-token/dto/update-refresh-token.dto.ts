// update-refresh-token.dto.ts
import { IsBoolean, IsOptional, IsDate, IsString } from 'class-validator';

export class UpdateRefreshTokenDto {
  @IsOptional()
  @IsBoolean()
  revoked?: boolean;

  @IsOptional()
  @IsDate()
  revokedat?: Date;

  @IsOptional()
  @IsString()
  ipadress?: string;

  @IsOptional()
  @IsString()
  useragent?: string;
}

export class UpdateSellerRefreshTokenDto {
  @IsOptional()
  @IsBoolean()
  revoked?: boolean;

  @IsOptional()
  @IsDate()
  revokedat?: Date;

  @IsOptional()
  @IsString()
  ipadress?: string;

  @IsOptional()
  @IsString()
  selleragent?: string;
}