import { ChildEntity, Column, OneToOne } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Method } from '../enums/payment-method.enum';

@ChildEntity(Method.LOYALTY_CARD)
export class LoyaltyCardPaymentMethod extends PaymentMethod {
  @Column()
  cardNumber: string;

  @Column()
  pointsRedeemed: number;

  @OneToOne(() => Customer, (customer) => customer.loyaltyCard)
  customer: Customer;
}
