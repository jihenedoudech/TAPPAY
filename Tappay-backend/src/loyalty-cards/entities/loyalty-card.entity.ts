import { Customer } from '../../customers/entities/customer.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
} from 'typeorm';
import { LoyaltyCardStatus } from '../enums/loyalty-card-status.enum';

@Entity('loyalty_cards')
export class LoyaltyCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  reference: string;

  @Column({ default: 0 })
  points: number;

  @Column({ type: 'date' })
  expirationDate: Date;

  @CreateDateColumn()
  creationDate: Date;

  @Column({ nullable: true, type: 'date' })
  renewedDate: Date;

  @Column({
    type: 'enum',
    enum: LoyaltyCardStatus,
    default: LoyaltyCardStatus.ACTIVE,
  })
  status: LoyaltyCardStatus;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Customer, (customer) => customer.loyaltyCard, {
    onDelete: 'SET NULL',
    nullable: false,
  })
  customer: Customer;

  @BeforeInsert()
  setExpirationDate() {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 3);
    this.expirationDate = currentDate;
  }
}
