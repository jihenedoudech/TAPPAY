import { Supplier } from '../../suppliers/entities/supplier.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';
import { decimalTransformer } from '../../utils/functions';
import { User } from '../../users/entities/user.entity';

@Entity('purchase_records')
export class PurchaseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseRecords, {
    nullable: true,
  })
  supplier: Supplier;

  @Column({ nullable: false })
  date: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  total: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  discount: number;

  @OneToMany(
    () => PurchaseItem,
    (purchaseItem) => purchaseItem.purchaseRecord,
    { cascade: true },
  )
  purchasedItems: PurchaseItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;
}
