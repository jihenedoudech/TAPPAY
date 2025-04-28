import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStockMovementItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes: string;
}
