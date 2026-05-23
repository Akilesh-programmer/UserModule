import { IsBoolean, IsMongoId, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AddressDto } from '../address.dto';

export class UpdateSalesRepDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Mobile must be exactly 10 digits' })
  mobile?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{12}$/, { message: 'Aadhaar number must be exactly 12 digits' })
  aadhaarNo?: string;

  @IsOptional()
  @IsString()
  drivingLicenseNo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}\d{4}[A-Z]$/, { message: 'PAN card must be in format: ABCDE1234F' })
  panCardNo?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid manager ID' })
  managerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  profilePic?: string;
}
