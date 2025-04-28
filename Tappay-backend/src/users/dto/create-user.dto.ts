import { Type } from 'class-transformer';
import { Address } from '../../addresses/entities/address.entity';
import { Role } from '../../auth/enums/role.enum';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  IsOptional,
  IsArray,
  IsDate,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  // @IsNotEmpty()
  @IsArray()
  assignedStoresIds: number[];

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  nationalId: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsOptional()
  @IsNumber()
  salaryAmount: number;

  @IsOptional()
  @IsString()
  preferedLanguage: string;
}
