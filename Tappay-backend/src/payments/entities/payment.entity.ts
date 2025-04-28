import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from './payment-method.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  transactionRef: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
  totalAmountDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
  totalPaidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, default: 0 })
  remainingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, default: 0 })
  changeAmount: number;

  @Column({nullable : false})
  isFullyPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.payment,
  )
  paymentMethods: PaymentMethod[];

  @ManyToOne(() => Order, (order) => order.payments, { nullable: false})
  order: Order;
}
