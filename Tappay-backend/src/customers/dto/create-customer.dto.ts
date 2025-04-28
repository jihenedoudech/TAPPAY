import { IsString, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';
import { CreateLoyaltyCardDto } from '../../loyalty-cards/dto/create-loyalty-card.dto';
import { CustomerStatus } from '../enums/customer-status.enum';

export class CreateCustomerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  cin: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLoyaltyCardDto)
  loyaltyCard: CreateLoyaltyCardDto;

  @IsEnum(CustomerStatus)
  status: CustomerStatus;

  @IsOptional()
  @IsString()
  dateOfBirth: string;
}
