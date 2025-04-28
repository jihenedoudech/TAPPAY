import { ChildEntity, Column } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Method } from '../enums/payment-method.enum';

@ChildEntity(Method.CASH)
export class CashPaymentMethod extends PaymentMethod {}