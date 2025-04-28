import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefundItemDto {
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
