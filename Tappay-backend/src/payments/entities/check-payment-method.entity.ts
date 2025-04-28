import { ChildEntity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Method } from '../enums/payment-method.enum';

@ChildEntity(Method.CHECK)
export class CheckPaymentMethod extends PaymentMethod {
  @Column()
  checkNumber: string;

  @Column()
  bankName: string;

  @Column()
  accountHolderName: string;

  @Column({ nullable: true })
  issueDate: Date;
}
