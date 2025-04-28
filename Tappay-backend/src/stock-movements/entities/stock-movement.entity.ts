import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { StockMovementItem } from './stock-movement-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store, { nullable: false })
  fromStore: Store;

  @ManyToOne(() => Store, { nullable: false })
  toStore: Store;

  @Column({ nullable: false })
  movementDate: Date;

  @OneToMany(() => StockMovementItem, (item) => item.stockMovement, {
    cascade: true,
  })
  items: StockMovementItem[];

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @Column({ nullable: true })
  notes: string;
}
