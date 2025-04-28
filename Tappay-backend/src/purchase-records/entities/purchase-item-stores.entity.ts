import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';
import { Store } from '../../stores/entities/store.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('purchase_item_stores')
export class PurchaseItemStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false
  })
  quantity: number;

  @ManyToOne(
    () => PurchaseItem,
    (purchaseItem) => purchaseItem.purchaseItemStores,
    { onDelete: 'CASCADE', nullable: false },
  )
  purchaseItem: PurchaseItem;

  @ManyToOne(() => Store, (store) => store.purchaseItemStores, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  store: Store;
}
