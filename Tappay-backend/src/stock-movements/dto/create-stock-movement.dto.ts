import { Type } from 'class-transformer';
import { StockMovementItem } from '../entities/stock-movement-item.entity';
import { IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { CreateStockMovementItemDto } from './create-stock-movement-item.dto';

export class CreateStockMovementDto {
  @IsNotEmpty()
  fromStoreId: string;

  @IsNotEmpty()
  toStoreId: string;

  @IsNotEmpty()
  @Type(() => Date)
  movementDate: Date;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateStockMovementItemDto)
  items: CreateStockMovementItemDto[];

  @IsOptional()
  @IsString()
  notes: string;
}
