import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseRecord } from './purchase-record.entity';
import { decimalTransformer } from '../../utils/functions';
import { PurchaseItemStore } from './purchase-item-stores.entity';
import { ProductDetails } from '../../products/entities/product-details.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductDetails, { nullable: false })
  productDetails: ProductDetails;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  priceExclTax: number;

  @Column({ default: 0 })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  priceInclTax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  total: number;

  @ManyToOne(
    () => PurchaseRecord,
    (purchaseRecord) => purchaseRecord.purchasedItems,
    { onDelete: 'CASCADE', nullable: false },
  )
  purchaseRecord: PurchaseRecord;

  @OneToMany(
    () => PurchaseItemStore,
    (purchaseItemStore) => purchaseItemStore.purchaseItem,
  )
  purchaseItemStores: PurchaseItemStore[];
}
