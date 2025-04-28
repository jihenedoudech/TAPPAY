import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { Method } from './enums/payment-method.enum';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/entities/order.entity';
import { CashPaymentMethod } from './entities/cash-payment-method.entity';
import { CardPaymentMethod } from './entities/card-payment-method.entity';
import { CheckPaymentMethod } from './entities/check-payment-method.entity';
import { LoyaltyCardPaymentMethod } from './entities/loyalty-card-payment-method.entity';
import { VoucherPaymentMethod } from './entities/voucher-payment-method.entity';
import { OrderStatus } from '../orders/enums/order.enum';
import { DataSource } from 'typeorm';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    private readonly ordersService: OrdersService,
    private dataSource: DataSource,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    console.log('createPaymentDto: ', createPaymentDto);

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.ordersService.findOne(createPaymentDto.orderId);
      console.log('order: ', order);

      // Create the payment object
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        order,
      });

      const paymentMethods = [];

      // Loop through each payment method and instantiate the correct class based on the method
      for (const paymentMethodDto of createPaymentDto.paymentMethods) {
        let paymentMethod;

        switch (paymentMethodDto.method) {
          case Method.CASH:
            paymentMethod = new CashPaymentMethod();
            break;
          case Method.CARD:
            paymentMethod = new CardPaymentMethod();
            break;
          case Method.CHECK:
            paymentMethod = new CheckPaymentMethod();
            break;
          case Method.LOYALTY_CARD:
            paymentMethod = new LoyaltyCardPaymentMethod();
            break;
          case Method.VOUCHER:
            paymentMethod = new VoucherPaymentMethod();
            break;
          default:
            throw new Error(
              `Unknown payment method: ${paymentMethodDto.method}`,
            );
        }

        Object.assign(paymentMethod, paymentMethodDto);
        paymentMethod.payment = payment;
        paymentMethods.push(paymentMethod);
      }

      // Save the payment
      await queryRunner.manager.save(payment);

      // Save the payment methods
      await queryRunner.manager.save(paymentMethods);

      // Complete the order
      // await queryRunner.manager.update(Order, createPaymentDto.orderId, {
      //   status: OrderStatus.COMPLETED,
      // });
      await this.ordersService.completeOrder(
        createPaymentDto.orderId,
        queryRunner,
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      console.log('payment: ', payment);
      return payment;
    } catch (error) {
      console.error('Transaction failed:', error);

      // Rollback the transaction
      await queryRunner.rollbackTransaction();

      throw error; // Re-throw the error so it can be handled upstream
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  // create(createPaymentDto: CreatePaymentDto) {
  //   switch (createPaymentDto.method) {
  //     case PaymentMethod.CASH:
  //       return this.handleCash(createPaymentDto);
  //     case PaymentMethod.CARD:
  //       return this.handleCard(createPaymentDto);
  //     case PaymentMethod.CHECK:
  //       return this.handleCheck(createPaymentDto);
  //     case PaymentMethod.LOYALTY_CARD:
  //       return this.handleLoyaltyCard(createPaymentDto);
  //     case PaymentMethod.VOUCHER:
  //       return this.handleVoucher(createPaymentDto);
  //     default:
  //       throw new Error('Unsupported payment method');
  //   }
  // }

  // private handleCash(createPaymentDto: CreatePaymentDto) {
  //   return {
  //     status: 'SUCCESS',
  //     change: createPaymentDto.amountPaid - createPaymentDto.amount,
  //   };
  // }

  // private async handleCard(createPaymentDto: CreatePaymentDto) {
  //   // Use a payment gateway like Stripe for card payments
  //   return { status: 'SUCCESS', transactionId: 'STRIPE12345' };
  // }

  // private handleCheck(createPaymentDto: CreatePaymentDto) {
  //   // Validate check details
  //   return { status: 'SUCCESS', transactionId: 'CHK67890' };
  // }

  // private handleLoyaltyCard(createPaymentDto: CreatePaymentDto) {
  //   // Deduct loyalty points
  //   return { status: 'SUCCESS', pointsUsed: createPaymentDto.points };
  // }

  // private handleVoucher(createPaymentDto: CreatePaymentDto) {
  //   // Validate and apply voucher
  //   return { status: 'SUCCESS', discountApplied: createPaymentDto.amount };
  // }

  findAll() {
    return this.paymentRepository.find();
  }

  findOne(id: string) {
    return this.paymentRepository.findOne({ where: { id } });
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return this.paymentRepository.update(id, updatePaymentDto);
  }

  remove(id: string) {
    return this.paymentRepository.delete(id);
  }
}
