import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDetailsDto } from '../../products/dto/product-details.dto';

class StoreDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  sellingPrice?: number;
}

export class CreatePurchaseItemDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  productDetails: ProductDetailsDto;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  priceExclTax?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsNotEmpty()
  @IsNumber()
  priceInclTax: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreDto)
  stores: StoreDto[];

  @IsOptional()
  @IsNumber()
  localId?: number;

  @IsOptional()
  @IsNumber()
  parentLocalId?: number;

  @IsOptional()
  @IsBoolean()
  isChild?: boolean;
}
