import { Injectable, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftStatus } from './enums/shift.enum';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/enums/order.enum';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    private ordersService: OrdersService,
  ) {}

  async create(createShiftDto: CreateShiftDto, user: User) {
    const shift = {
      ...createShiftDto,
      user: { id: user.id },
      store: { id: createShiftDto.storeId },
      status: ShiftStatus.OPEN,
      startTime: new Date(),
    };
    const result = await this.shiftsRepository.save(shift);
    const newShift = await this.shiftsRepository.findOne({
      where: { id: result.id },
      relations: ['user', 'store'],
    });
    console.log('newShift', newShift);
    return newShift;
  }

  findAll() {
    return this.shiftsRepository.find({
      relations: ['user', 'store'],
      order: { startTime: 'DESC' },
    });
  }

  findOne(id: string) {
    console.log('id', id);
    return this.shiftsRepository.find({
      where: { id },
      relations: ['user', 'orders', 'store', 'orders.purchasedItems'],
    });
  }

  findCurrent(userId: string) {
    if (!userId) {
      throw new Error('User must be provided with a valid ID');
    }
    return this.shiftsRepository.findOne({
      where: {
        status: ShiftStatus.OPEN,
        user: { id: userId },
      },
      relations: ['user', 'orders'],
    });
  }

  update(id: string, updateShiftDto: UpdateShiftDto) {
    return this.shiftsRepository.update(id, updateShiftDto);
  }

  async updateAfterOrderComplete(
    order: Order,
    runner: QueryRunner,
  ): Promise<void> {
    const shift = order.shift;
    console.log('shift', shift);
    console.log('order in shift service', order);
    if (!shift) {
      throw new Error(`Shift with ID ${order.shift.id} not found`);
    }
    shift.totalAmount += order.totalAmount;
    shift.totalItems += order.totalItems;
    shift.totalSales += order.totalAmount;
    shift.totalCost += order.totalCost;
    shift.totalProfit += order.totalProfit;
    shift.totalTransactions += 1;
    await runner.manager.save(shift);
  }

  async close(
    id: string,
    queryRunner?: QueryRunner,
  ) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!shift) {
      throw new Error(`Shift with ID ${id} not found`);
    }

    const draftOrders = shift.orders.filter(
      (order) => order.status === OrderStatus.DRAFT,
    );

    // Use for...of to ensure each cancelOrder operation completes before moving to the next one
    for (const order of draftOrders) {
      await this.ordersService.cancelOrder(order.id, queryRunner);
    }

    return await (queryRunner
      ? queryRunner.manager.update(Shift, id, {
          status: ShiftStatus.CLOSED,
          endTime: new Date(),
        })
      : this.shiftsRepository.update(id, {
          status: ShiftStatus.CLOSED,
          endTime: new Date(),
        }));
  }

  async updateShiftTotals(shiftId: string, queryRunner: QueryRunner) {
    // Use queryRunner.manager.findOne so it participates in the same transaction.
    const shift = await queryRunner.manager.findOne(Shift, {
      where: { id: shiftId },
      relations: ['orders'],
    });
    console.log('shift', shift);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }
    // Recalculate shift totals based on all orders.
    const totalRefunds = shift.orders.reduce(
      (sum, ord) => sum + ord.totalRefund,
      0,
    );
    const totalSales = shift.orders.reduce(
      (sum, ord) => sum + ord.totalAmount,
      0,
    );
    const totalItems = shift.orders.reduce(
      (sum, ord) => sum + ord.totalItems,
      0,
    );
    const totalProfit = shift.orders.reduce(
      (sum, ord) => sum + ord.totalProfit,
      0,
    );
    const totalCost = shift.orders.reduce((sum, ord) => sum + ord.totalCost, 0);
    shift.totalRefunds = totalRefunds;
    shift.totalSales = totalSales;
    shift.totalItems = totalItems;
    shift.totalProfit = totalProfit;
    shift.totalCost = totalCost;
    const savedShift = await queryRunner.manager.save(shift);
    console.log('savedShift', savedShift);
  }

  remove(id: string) {
    return this.shiftsRepository.delete(id);
  }
}
