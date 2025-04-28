import { Module } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementItem } from './entities/stock-movement-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresModule } from '../stores/stores.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, StockMovementItem]),
    StoresModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
})
export class StockMovementsModule {}
