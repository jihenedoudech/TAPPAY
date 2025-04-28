import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';
import { Type } from 'class-transformer';

export class CreatePurchaseRecordDto {
  @IsOptional()
  @IsString()
  supplierId: string;

  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsOptional()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @Type(() => CreatePurchaseItemDto)
  purchasedItems: CreatePurchaseItemDto[];
}
