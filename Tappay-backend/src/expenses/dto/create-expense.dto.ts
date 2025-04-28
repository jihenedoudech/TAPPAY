import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ExpenseType } from '../enums/expense-type.enum';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsNotEmpty()
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsNumber()
  productId?: string;

  @ValidateIf((o) => o.type === ExpenseType.EXTERNAL)
  @IsNotEmpty()
  externalExpenseName?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  cost?: number;

  @IsOptional()
  @IsString()
  notes: string;
}
