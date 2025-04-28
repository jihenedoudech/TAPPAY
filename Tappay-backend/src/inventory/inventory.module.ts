import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { InventoryLine } from './entities/inventory-line.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStore } from '../products/entities/product-store.entity';
import { StoresModule } from '../stores/stores.module';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  imports: [TypeOrmModule.forFeature([Inventory, InventoryLine, ProductStore]), StoresModule],  
})
export class InventoryModule {}
