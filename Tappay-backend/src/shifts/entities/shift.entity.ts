import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { decimalTransformer } from '../../utils/functions';
import { ShiftStatus } from '../enums/shift.enum';
import { Store } from '../../stores/entities/store.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ type: 'enum', enum: ShiftStatus, nullable: false })
  status: ShiftStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  openingCashAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalSales: number;

  @Column({ default: 0 })
  totalItems: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalDiscounts: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalRefunds: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalProfit: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  totalCost: number;

  @Column({ default: 0 })
  totalTransactions: number;

  @ManyToOne(() => User, (user) => user.shifts, { nullable: false })
  user: User;

  @ManyToOne(() => Store, (store) => store.shifts, { nullable: false })
  store: Store;

  @OneToMany(() => Order, (order) => order.shift)
  orders: Order[];
}
