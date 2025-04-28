import { IsNotEmpty } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  openingCashAmount: number;

  @IsNotEmpty()
  storeId: string;
}
