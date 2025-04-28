import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { DiscountType } from '../enums/discount-type.enum';
import { PriceTierDto } from './price-tier.dto';
import { ProductStockBatchDto } from './product-batch-stock.dto';

export class ProductStoreDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  productDetailsId?: string;

  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  minimumSalePrice?: number;

  @IsOptional()
  @IsNumber()
  stockAlertLevel?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  loyaltyPointsEarned?: number;

  @IsOptional()
  @IsNumber()
  loyaltyPointsRedeemed?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  pricingTiers?: PriceTierDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  stockBatches?: ProductStockBatchDto[];

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
