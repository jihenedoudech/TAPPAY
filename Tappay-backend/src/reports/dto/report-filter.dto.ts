import { Transform, Type } from 'class-transformer';
import { IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { OrderStatus } from '../../orders/enums/order.enum';

export class ReportFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsEnum(['day', 'week', 'month'], {
    message: 'Period must be day, week, or month',
  })
  period?: string;

  @IsOptional()
  storeId?: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(OrderStatus, { each: true })
  ordersStatus?: OrderStatus[];

  @IsOptional()
  categoriesIds?: number[];

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  displayLimit?: number;

  @IsOptional()
  @IsNumber()
  userId?: string;
}
