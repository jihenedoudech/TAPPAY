import { ChildEntity, Column } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Method } from '../enums/payment-method.enum';

@ChildEntity(Method.CARD)
export class CardPaymentMethod extends PaymentMethod {
  @Column()
  cardNumber: string;

  @Column()
  cardHolderName: string;

  @Column()
  expirationDate: string;

  @Column()
  cvv: string;

  @Column({ nullable: true })
  authorizationCode: string;
}
