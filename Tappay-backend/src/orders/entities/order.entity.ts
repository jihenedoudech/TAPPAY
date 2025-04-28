import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { decimalTransformer } from '../../utils/functions';
import { Shift } from '../../shifts/entities/shift.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderStatus } from '../enums/order.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  orderNumber: string;

  @Column({ nullable: false })
  storeId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status: OrderStatus;

  @ManyToOne(() => Customer, { nullable: true })
  customer: Customer;

  @Column({ type: 'timestamp', nullable: false })
  dateTime: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalDiscount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalRefund: number;

  @Column({ nullable: false })
  totalItems: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  totalCost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  totalProfit: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  purchasedItems: OrderItem[];

  @ManyToOne(() => Shift, { nullable: false })
  shift: Shift;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
