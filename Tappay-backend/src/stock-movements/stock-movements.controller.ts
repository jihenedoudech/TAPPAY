import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post('undo')
  async undoStockMovement(@Query('stockMovementId') stockMovementId: string) {
    return this.stockMovementsService.undoStockMovement(stockMovementId);
  }

  @Post()
  async create(@Body() createDto: CreateStockMovementDto, @Request() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is missing from the request.');
    }
    return this.stockMovementsService.create(createDto, userId);
  }

  @Get()
  async findAll() {
    return this.stockMovementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockMovementsService.remove(id);
  }
}
