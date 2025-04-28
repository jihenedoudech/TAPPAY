import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { UnitOfMeasure } from '../enums/unit-of-mesure.enum';
import { Type } from 'class-transformer';
import { ProductType } from '../enums/product-type.enum';
export class ProductDetailsDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  barcodes?: BarcodeDto[];

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: typeof UnitOfMeasure;

  @IsOptional()
  @IsNumber()
  piecesPerPack?: number;

  @IsOptional()
  @IsBoolean()
  returnable?: boolean;

  @IsOptional()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentDto)
  components?: ComponentDto[];
}

export class BarcodeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  barcode: string;

  @IsOptional()
  description?: string;
}

export class ComponentDto {
  @IsNotEmpty()
  @IsString()
  ProductId?: string;

  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsNotEmpty()
  @IsEnum(ProductType)
  type: ProductType;
}
