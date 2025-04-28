import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AppDataSource } from './typeorm.config';
import { ShiftsModule } from './shifts/shifts.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { LoyaltyCardsModule } from './loyalty-cards/loyalty-cards.module';
import { PurchaseRecordsModule } from './purchase-records/purchase-records.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaymentsModule } from './payments/payments.module';
import { StoresModule } from './stores/stores.module';
import { AddressesModule } from './addresses/addresses.module';
import { ReportsModule } from './reports/reports.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    ProductsModule,
    UsersModule,
    ShiftsModule,
    AuthModule,
    CustomersModule,
    SuppliersModule,
    OrdersModule,
    CategoriesModule,
    LoyaltyCardsModule,
    PurchaseRecordsModule,
    PaymentsModule,
    StoresModule,
    AddressesModule,
    ReportsModule,
    StockMovementsModule,
    ExpensesModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
