import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TaxType {
  GST = 'GST',
  IGST = 'IGST',
  CGST = 'CGST',
  SGST = 'SGST',
  VAT = 'VAT',
  CESS = 'CESS',
  OTHER = 'OTHER',
}

export class CreateTaxDto {
  @IsNotEmpty({ message: 'Tax name is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

  @IsNotEmpty({ message: 'Tax percentage is required' })
  @IsNumber({}, { message: 'Percentage must be a number' })
  @Min(0, { message: 'Percentage cannot be negative' })
  @Max(100, { message: 'Percentage cannot exceed 100' })
  percentage!: number;

  @IsNotEmpty({ message: 'Tax type is required' })
  @IsEnum(TaxType, { message: 'Tax type must be one of: GST, IGST, CGST, SGST, VAT, CESS, OTHER' })
  taxType!: TaxType;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  hsnCode?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
