import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNumber()
  sellingPrice: number;

  // @IsNumber()
  // total: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsNumber()
  profit?: number;
}
