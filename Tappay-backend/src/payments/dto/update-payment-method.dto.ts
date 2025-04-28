import { IsOptional, IsString } from "class-validator";
import { CreatePaymentMethodDto } from "./create-payment-method.dto";

export class UpdatePaymentMethodDto extends CreatePaymentMethodDto {
  @IsString()
  @IsOptional()
  id?: string;
}
