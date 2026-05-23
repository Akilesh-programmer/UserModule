import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGroupDto {
  @IsNotEmpty({ message: 'Group name is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

  @IsNotEmpty({ message: 'Group code is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  code!: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsMongoId({ message: 'Invalid category ID' })
  categoryId!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
