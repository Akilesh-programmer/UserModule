import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AddressDto } from '../address.dto';

export class CreateSalesRepDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

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

  @IsNotEmpty({ message: 'Manager is required' })
  @IsMongoId({ message: 'Invalid manager ID' })
  managerId!: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  username!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password!: string;

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
