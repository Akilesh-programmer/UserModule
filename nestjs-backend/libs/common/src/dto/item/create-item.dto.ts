import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  @IsNotEmpty({ message: 'Item name is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  itemName!: string;

  @IsNotEmpty({ message: 'Item code is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  itemCode!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsMongoId({ message: 'Invalid category ID' })
  categoryId!: string;

  @IsNotEmpty({ message: 'Group is required' })
  @IsMongoId({ message: 'Invalid group ID' })
  groupId!: string;

  @IsNotEmpty({ message: 'Tax is required' })
  @IsMongoId({ message: 'Invalid tax ID' })
  taxId!: string;

  @IsNotEmpty({ message: 'Unit of measure is required' })
  @IsMongoId({ message: 'Invalid unit of measure ID' })
  uomId!: string;

  @IsNotEmpty({ message: 'Packing type is required' })
  @IsMongoId({ message: 'Invalid packing type ID' })
  packingTypeId!: string;

  @IsNotEmpty({ message: 'Item price is required' })
  @IsNumber({}, { message: 'Item price must be a number' })
  @Min(0, { message: 'Item price cannot be negative' })
  itemPrice!: number;

  @IsNotEmpty({ message: 'Items per box is required' })
  @IsNumber({}, { message: 'Items per box must be a number' })
  @Min(1, { message: 'Items per box must be at least 1' })
  itemsPerBox!: number;

  @IsNotEmpty({ message: 'Box rate is required' })
  @IsNumber({}, { message: 'Box rate must be a number' })
  @Min(0, { message: 'Box rate cannot be negative' })
  boxRate!: number;

  @IsNotEmpty({ message: 'Piece rate is required' })
  @IsNumber({}, { message: 'Piece rate must be a number' })
  @Min(0, { message: 'Piece rate cannot be negative' })
  pieceRate!: number;

  @IsOptional()
  @IsNumber({}, { message: 'MRP must be a number' })
  @Min(0, { message: 'MRP cannot be negative' })
  mrp?: number;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Min stock level must be a number' })
  @Min(0, { message: 'Min stock level cannot be negative' })
  minStockLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Max stock level must be a number' })
  @Min(0, { message: 'Max stock level cannot be negative' })
  maxStockLevel?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
