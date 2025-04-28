import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { ProductStore } from '../../products/entities/product-store.entity';
import { ExpenseType } from '../enums/expense-type.enum';
import { User } from '../../users/entities/user.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, (store) => store.expenses, { nullable: false })
  store: Store;

  @Column({ type: 'enum', enum: ExpenseType, nullable: false })
  type: ExpenseType;

  @Column({ nullable: false })
  date: Date;

  @ManyToOne(() => ProductStore, { nullable: true })
  product?: ProductStore;

  @Column({ nullable: true })
  externalExpenseName?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  quantity: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  cost?: number;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @Column({ nullable: true })
  notes: string;
}
