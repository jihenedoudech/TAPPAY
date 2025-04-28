import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { ProductStore } from '../../products/entities/product-store.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('stock_movement_items')
export class StockMovementItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockMovement, (movement) => movement.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  stockMovement: StockMovement;

  @ManyToOne(() => ProductStore, { nullable: false })
  product: ProductStore;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: decimalTransformer,
    nullable: false
  })
  quantity: number;

  @Column({ nullable: true })
  notes: string;
}
