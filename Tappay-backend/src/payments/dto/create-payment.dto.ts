import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreatePaymentMethodDto } from './create-payment-method.dto';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  transactionRef?: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  totalAmountDue: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  totalPaidAmount: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  remainingAmount: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  changeAmount: number;

  @IsBoolean()
  isFullyPaid: boolean;

  @IsString()
  orderId: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePaymentMethodDto)
  paymentMethods: CreatePaymentMethodDto[];
}
