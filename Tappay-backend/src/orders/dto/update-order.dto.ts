import {
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateOrderItemDto } from './update-order-item.dto';
import { OrderStatus } from '../enums/order.enum';
import { Customer } from '../../customers/entities/customer.entity';

export class UpdateOrderDto {
  @IsString()
  id: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  customer?: Customer;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  totalItems?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  purchasedItems: UpdateOrderItemDto[];
}
