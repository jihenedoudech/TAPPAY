import { Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

export class PriceTierDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Minimum quantity must be at least 1.' })
  minimumQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
