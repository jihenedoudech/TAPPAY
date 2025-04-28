import { Store } from '../../stores/entities/store.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductDetails } from './product-details.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { decimalTransformer } from '../../utils/functions';
import { DiscountType } from '../enums/discount-type.enum';
import { PriceTier } from './price-tier.entity';
import { ProductStockBatch } from './product-stock-batch.entity';

@Entity('product_store')
export class ProductStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  sellingPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  minimumSalePrice: number;

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.NONE })
  discountType: DiscountType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  discountAmount: number;

  @Column({ default: 0 })
  stockAlertLevel: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  loyaltyPointsEarned: number;

  @Column({ nullable: true })
  loyaltyPointsRedeemed: number;

  @ManyToOne(
    () => ProductDetails,
    (productDetails) => productDetails.productStores,
    { nullable: false },
  )
  productDetails: ProductDetails;

  @ManyToOne(() => Store, (store) => store.id, { nullable: false })
  store: Store;

  @OneToMany(() => PriceTier, (priceTier) => priceTier.productStore, {
    cascade: true,
  })
  pricingTiers: PriceTier[];

  @OneToMany(
    () => ProductStockBatch,
    (productStockBatch) => productStockBatch.productStore,
    { cascade: true },
  )
  stockBatches: ProductStockBatch[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @Column({ default: 0 })
  salesCount: number;

  @DeleteDateColumn()
  isRemovedAt: Date;

  @ManyToOne(() => ProductStore, (parent) => parent.children, {
    nullable: true,
  })
  parent: ProductStore;

  @OneToMany(() => ProductStore, (child) => child.parent)
  children: ProductStore[];
}
