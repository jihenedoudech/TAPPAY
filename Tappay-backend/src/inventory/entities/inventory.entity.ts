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
import { InventoryLine } from './inventory-line.entity';
import { decimalTransformer } from '../../utils/functions';
import { InventoryStatus } from '../enums/inventory-status.enum';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InventoryStatus, nullable: false })
  status: InventoryStatus;

  @ManyToOne(() => Store, { nullable: false })
  store: Store;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  expectedValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  foundValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  lossValue: number;

  @OneToMany(() => InventoryLine, (inventoryLine) => inventoryLine.inventory, {
    cascade: true,
  })
  inventoryLines: InventoryLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
