import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [OrdersModule, ProductsModule, UsersModule, ShiftsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
