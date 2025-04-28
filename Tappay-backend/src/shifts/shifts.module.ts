import { forwardRef, Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shift]), forwardRef(() => OrdersModule)],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService, TypeOrmModule],
})
export class ShiftsModule {}
