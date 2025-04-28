import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderItemStatus } from '../enums/order-item.enum';

export class UpdateOrderItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsEnum(OrderItemStatus)
  @IsOptional()
  status?: OrderItemStatus;

  @IsString()
  @IsOptional()
  productId: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsNumber()
  // @IsQuantityValid()
  quantity: number;

  // @IsOptional()
  // @IsString()
  // unitOfMeasure: string;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsNumber()
  profit?: number;
}
