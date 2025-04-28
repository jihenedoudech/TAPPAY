import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { ProductStore } from '../../products/entities/product-store.entity';
import { decimalTransformer } from '../../utils/functions';
import { OrderItemStatus } from '../enums/order-item.enum';
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    nullable: false,
  })
  status: OrderItemStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  sellingPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false,
  })
  total: number;

  @ManyToOne(() => Order, (order) => order.purchasedItems, { nullable: false })
  order: Order;

  @ManyToOne(() => ProductStore, { nullable: false })
  product: ProductStore;

  @Column({ nullable: false })
  productName: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  cost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: true,
  })
  profit: number;
}
