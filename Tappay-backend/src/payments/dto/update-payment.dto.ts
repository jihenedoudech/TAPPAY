import {
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePaymentMethodDto } from './update-payment-method.dto';

export class UpdatePaymentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  transactionRef?: string;

  @IsNumber()
  totalAmountDue: number;

  @IsNumber()
  totalPaidAmount: number;

  @IsNumber()
  remainingAmount: number;

  @IsNumber()
  changeAmount: number;

  @IsBoolean()
  isFullyPaid: boolean;

  @IsString()
  orderId: string;

  @ValidateNested({ each: true })
  @Type(() => UpdatePaymentMethodDto)
  @IsOptional()
  paymentMethods?: UpdatePaymentMethodDto[];
}
