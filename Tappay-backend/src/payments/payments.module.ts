import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { OrdersModule } from '../orders/orders.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentMethod]), OrdersModule, ShiftsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
