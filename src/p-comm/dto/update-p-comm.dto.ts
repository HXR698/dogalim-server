import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdatePCommDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  evaluation?: number;
}
