import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  TableInheritance,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('payment_methods')
@TableInheritance({ column: { type: 'varchar', name: 'methodType' } })
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
  amount: number;

  @ManyToOne(() => Payment, (payment) => payment.paymentMethods)
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;
}
