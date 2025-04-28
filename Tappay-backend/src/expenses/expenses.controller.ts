// src/expenses/expenses.controller.ts
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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('bulk')
  bulkCreate(@Body() createExpenseDto: CreateExpenseDto[], @Request() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is missing from the request.');
    }
    return this.expensesService.bulkCreate(createExpenseDto, userId);
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is missing from the request.');
    }
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
