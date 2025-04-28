import { forwardRef, Module } from '@nestjs/common';
import { PurchaseRecordsService } from './purchase-records.service';
import { PurchaseRecordsController } from './purchase-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { ProductsModule } from '../products/products.module';
import { PurchaseItemsService } from './purchase-items.service';
import { PurchaseItem } from './entities/purchase-item.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRecord, PurchaseItem]), forwardRef(() => ProductsModule), UsersModule],
  controllers: [PurchaseRecordsController],
  providers: [PurchaseRecordsService, PurchaseItemsService],
  exports: [PurchaseRecordsService, PurchaseItemsService],
})
export class PurchaseRecordsModule {}
