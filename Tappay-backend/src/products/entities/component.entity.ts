import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ProductDetails } from './product-details.entity';
import { decimalTransformer } from '../../utils/functions';

@Entity('product_components')
export class ProductComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductDetails, (product) => product.components, {
    onDelete: 'CASCADE',
    nullable: false
  })
  finalProduct: ProductDetails;

  @ManyToOne(() => ProductDetails, { onDelete: 'CASCADE', nullable: false })
  componentProduct: ProductDetails;

  @Column({ type: 'decimal', precision: 10, scale: 3, transformer: decimalTransformer, nullable: false })
  qty: number;
}
