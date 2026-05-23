import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePackingTypeDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Units per pack must be a number' })
  @Min(1, { message: 'Units per pack must be at least 1' })
  unitsPerPack?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
