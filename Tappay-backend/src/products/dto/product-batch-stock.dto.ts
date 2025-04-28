import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockBatchOrigin } from '../enums/stock-batch-origin.enum';

export class ProductStockBatchDto {
  @IsOptional()
  @IsString()
  productStoreId: string;

  @IsNotEmpty()
  @IsNumber()
  originalStock: number;

  @IsNotEmpty()
  @IsNumber()
  currentStock: number;

  @IsOptional()
  @IsNumber()
  costExclTax?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsNotEmpty()
  @IsNumber()
  costInclTax: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  purchaseDate: Date;

  @IsOptional()
  @IsNumber()
  supplierId?: string;

  @IsEnum(StockBatchOrigin)
  origin: StockBatchOrigin;

  @IsString()
  originId: string;
}
