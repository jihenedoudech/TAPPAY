import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductDetails } from './entities/product-details.entity';
import { ProductStockBatch } from './entities/product-stock-batch.entity';
import { ProductsStockBatchService } from './products-stock-batch.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { PriceTier } from './entities/price-tier.entity';
import { ProductStore } from './entities/product-store.entity';
import { Barcode } from './entities/barcode.entity';
import { ProductComponent } from './entities/component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductDetails, ProductStockBatch, PriceTier, ProductStore, Barcode, ProductComponent]),
    SuppliersModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsStockBatchService],
  exports: [ProductsService, ProductsStockBatchService, TypeOrmModule],
})
export class ProductsModule {}
