import {
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @IsOptional()
  @IsString()
  customerId: string;

  @IsDateString()
  dateTime: string;

  @IsNumber()
  @Type(() => Number)
  totalAmount: number;

  @IsNumber()
  totalItems: number;

  @IsString()
  shiftId: string;

  @IsString()
  storeId: string;

  @IsArray()
  @ValidateNested({ always: true })
  @Type(() => CreateOrderItemDto)
  purchasedItems: CreateOrderItemDto[];
}
