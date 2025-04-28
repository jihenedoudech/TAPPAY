import { IsNumber, IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { Method } from '../enums/payment-method.enum';
import { Type } from 'class-transformer';

export class CreatePaymentMethodDto {
  @IsEnum(Method)
  method: Method;

  @IsNumber()
  amount: number;

  // Card-specific fields
  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  @IsOptional()
  cardHolderName?: string;

  @IsString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  cvv?: string;

  @IsString()
  @IsOptional()
  authorizationCode?: string;

  // Check-specific fields
  @IsString()
  @IsOptional()
  checkNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  issueDate?: Date;

  // Loyalty Card-specific fields
  @IsString()
  @IsOptional()
  loyaltyCardNumber?: string;

  @IsNumber()
  @IsOptional()
  pointsRedeemed?: number;

  // Voucher-specific fields
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsDate()
  @IsOptional()
  expiryDate?: Date;
}
