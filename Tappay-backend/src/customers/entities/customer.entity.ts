import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';
import { LoyaltyCard } from '../../loyalty-cards/entities/loyalty-card.entity';
import { Order } from '../../orders/entities/order.entity';
import { CustomerStatus } from '../enums/customer-status.enum';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  cin: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToOne(() => Address, { cascade: true, nullable: true })
  @JoinColumn()
  address: Address;

  @OneToOne(() => LoyaltyCard, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  loyaltyCard: LoyaltyCard;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @CreateDateColumn()
  registrationDate: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orderHistory: Order[];
}
