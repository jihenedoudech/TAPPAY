import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { decimalTransformer } from '../../utils/functions';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { StockBatchOrigin } from '../enums/stock-batch-origin.enum';
import { ProductStore } from './product-store.entity';

@Entity()
export class ProductStockBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductStore, (productStore) => productStore.stockBatches, {
    nullable: false,
  })
  productStore: ProductStore;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  originalStock: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  currentStock: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  costExclTax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    default: 0,
  })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  costInclTax: number;

  @Column({ type: 'date', nullable: false })
  purchaseDate: Date;

  @Column({
    type: 'enum',
    enum: StockBatchOrigin,
    nullable: false,
  })
  origin: StockBatchOrigin;

  @Column({ nullable: false })
  originId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.productStockBatches, {
    nullable: true,
  })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;
}
