import { Address } from '../../addresses/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseRecord } from '../../purchase-records/entities/purchase-record.entity';
import { ProductStockBatch } from '../../products/entities/product-stock-batch.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => PurchaseRecord,
    (purchaseRecord) => purchaseRecord.supplier,
  )
  purchaseRecords: PurchaseRecord[];

  @OneToMany(() => ProductStockBatch, (productStockBatch) => productStockBatch.supplier)
  productStockBatches: ProductStockBatch[];
}
