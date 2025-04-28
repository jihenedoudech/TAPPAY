import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { StoresModule } from '../stores/stores.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [TypeOrmModule.forFeature([Expense]), StoresModule, ProductsModule, UsersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
