import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyCardsModule } from 'src/loyalty-cards/loyalty-cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), LoyaltyCardsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
