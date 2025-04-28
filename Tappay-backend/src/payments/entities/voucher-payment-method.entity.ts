import { ChildEntity, Column } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Method } from '../enums/payment-method.enum';

@ChildEntity(Method.VOUCHER)
export class VoucherPaymentMethod extends PaymentMethod {
  @Column()
  voucherCode: string;

  @Column()
  issuer: string;

  @Column({ nullable: true })
  expiryDate: Date;
}
