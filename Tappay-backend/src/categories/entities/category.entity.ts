// src/products/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductDetails } from '../../products/entities/product-details.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ProductDetails, (product) => product.category)
  products: ProductDetails[];
}
