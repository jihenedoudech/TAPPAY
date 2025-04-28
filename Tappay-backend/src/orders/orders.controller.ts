import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RefundItemDto } from './dto/refund-item.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllOrders(@Request() req) {
    return this.ordersService.findAllOrders(req.user.role);
  }

  @Get('items')
  findAllPurchasedItems() {
    return this.ordersService.findAllPurchasedItems();
  }

  @Get('with-relations/:id')
  findOneWithRelations(@Param('id') id: string) {
    return this.ordersService.findOneWithRelations(id);
  }

  @Get('by-date/:date')
  async findByDate(@Param('date') date: string, @Request() req) {
    return this.ordersService.findByDate(date, req.user.role);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    console.log('createOrderDto: ', createOrderDto);
    return this.ordersService.createOrderDraft(createOrderDto);
  }

  @Post('refund/:id')
  async refundOrder(
    @Param('id') orderId: string,
    @Body() refundItems: RefundItemDto[],
  ) {
    console.log('refundItems: ', refundItems);
    console.log('orderId: ', orderId);
    return this.ordersService.refundOrderItems(orderId, refundItems);
  }

  @Patch('complete/:id')
  completeOrder(@Param('id') id: string) {
    return this.ordersService.completeOrder(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateDraftOrder(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
