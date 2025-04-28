import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductDetails } from './product-details.entity';

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  barcode: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(
    () => ProductDetails,
    (productDetails) => productDetails.barcodes,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'productDetailsId' })
  productDetails: ProductDetails;
}
