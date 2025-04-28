import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
import { decimalTransformer } from '../../utils/functions';
import { ProductStore } from './product-store.entity';

  @Entity('price_tiers')
  export class PriceTier {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => ProductStore, (productStore) => productStore.pricingTiers, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'productStoreId' })
    productStore: ProductStore;
  
    @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
    minimumQuantity: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
    price: number;
  }
  