import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { UnitOfMeasure } from '../enums/unit-of-mesure.enum';
import { Barcode } from './barcode.entity';
import { ProductStore } from './product-store.entity';
import { ProductType } from '../enums/product-type.enum';
import { ProductComponent } from './component.entity';

@Entity('products_details')
export class ProductDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Barcode, (barcode) => barcode.productDetails, {
    cascade: true,
  })
  barcodes: Barcode[];

  @Column({ unique: true, nullable: true })
  reference: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'enum', enum: UnitOfMeasure, default: UnitOfMeasure.PIECE })
  unitOfMeasure: typeof UnitOfMeasure;

  @Column({ nullable: true })
  piecesPerPack: number;

  @Column({ default: false })
  returnable: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @CreateDateColumn()
  arrivalDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductStore, (productStore) => productStore.productDetails)
  productStores: ProductStore[];

  @ManyToOne(() => ProductDetails, (parent) => parent.children, {
    nullable: true,
  })
  parent: ProductDetails;

  @OneToMany(() => ProductDetails, (child) => child.parent)
  children: ProductDetails[];

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.FINAL, // or another default as needed
  })
  type: ProductType;

  @OneToMany(() => ProductComponent, (component) => component.finalProduct, {
    cascade: true,
  })
  components: ProductComponent[];
}
