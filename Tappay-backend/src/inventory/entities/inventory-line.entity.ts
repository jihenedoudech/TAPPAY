import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { ProductStore } from '../../products/entities/product-store.entity';
import { decimalTransformer } from '../../utils/functions';
import { InventoryStatus } from '../enums/inventory-status.enum';

@Entity('inventory_line')
export class InventoryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InventoryStatus, nullable: false })
  status: InventoryStatus;

  @ManyToOne(() => Inventory, (inventory) => inventory.inventoryLines, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  inventory: Inventory;

  @ManyToOne(() => ProductStore, { nullable: false, eager: true })
  productStore: ProductStore;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  expectedQty: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  foundQty: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  difference: number;

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
    nullable: true,
  })
  lossValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
