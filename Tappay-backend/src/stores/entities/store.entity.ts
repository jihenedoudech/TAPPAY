import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { PurchaseItemStore } from '../../purchase-records/entities/purchase-item-stores.entity';
import { Shift } from '../../shifts/entities/shift.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  taxIdentificationNumber: string;

  @Column({ type: 'boolean', nullable: false })
  isOpen: boolean;

  @Column({ type: 'json', nullable: true })
  operatingHours: Record<string, string>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string;

  @Column({ type: 'json', nullable: true })
  paymentMethods: string[];

  @Column({ nullable: true })
  warehouseLocation: string;

  @OneToOne(() => Address, { cascade: true, nullable: true })
  @JoinColumn()
  address: Address;

  @ManyToMany(() => User, (user) => user.assignedStores)
  users: User[];

  @OneToMany(() => Expense, (expense) => expense.store)
  expenses: Expense[];

  @OneToMany(
    () => PurchaseItemStore,
    (purchaseItemStore) => purchaseItemStore.store,
  )
  purchaseItemStores: PurchaseItemStore[];

  @OneToMany(() => Shift, (shift) => shift.store)
  shifts: Shift[];
}
