import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  taxId: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
