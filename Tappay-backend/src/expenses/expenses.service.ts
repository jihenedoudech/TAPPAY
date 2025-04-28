// src/expenses/expenses.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseType } from './enums/expense-type.enum';
import { ProductsService } from '../products/products.service';
import { StoresService } from '../stores/stores.service';
import { ProductsStockBatchService } from '../products/products-stock-batch.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private storesService: StoresService,
    private productsService: ProductsService,
    private productsStockBatchService: ProductsStockBatchService,
    private usersService: UsersService,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<Expense> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { storeId, type, productId, ...rest } = createExpenseDto;

    const store = await this.storesService.findOne(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    let localQueryRunner: QueryRunner | null = null;
    if (!queryRunner) {
      localQueryRunner =
        this.expenseRepository.manager.connection.createQueryRunner();
      await localQueryRunner.connect();
      await localQueryRunner.startTransaction();
    }

    const runner = queryRunner || localQueryRunner;
    const expenseRepo = runner.manager;

    try {
      const expense = expenseRepo.create(Expense, {
        store,
        createdBy: user,
        type,
        ...rest,
      });

      if (type === ExpenseType.INTERNAL) {
        if (!productId || !rest.quantity) {
          throw new BadRequestException(
            'Product ID and quantity are required for internal expenses',
          );
        }

        const product = await this.productsService.findProductStoreWithAvailableStock(
          productId,
          store.id,
        );
        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product.availableStock < rest.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.productDetails.name}`,
          );
        }
        expense.product = product;
        expense.quantity = rest.quantity;

        // Save the expense first to get the ID
        const savedExpense = await expenseRepo.save(expense);

        // Now that expense has an ID, update stock batches
        const cost = await this.productsStockBatchService.updateStockBatches(
          productId,
          rest.quantity,
          store.id,
          runner,
        );
        savedExpense.cost = cost;

        // Save the updated expense with cost
        await expenseRepo.save(savedExpense);
      } else if (type === ExpenseType.EXTERNAL) {
        // Handle EXTERNAL expense
        if (rest.quantity === undefined || rest.quantity === null) {
          throw new BadRequestException(
            'Quantity is required for external expenses',
          );
        }

        if (!rest.externalExpenseName) {
          throw new BadRequestException(
            'External expense name is required for EXTERNAL expenses',
          );
        }

        expense.externalExpenseName = rest.externalExpenseName;
        expense.cost = rest.cost; // Set the cost for external expense
        expense.quantity = rest.quantity;

        // Save the EXTERNAL expense
        const savedExpense = await expenseRepo.save(expense);

        // Return the saved expense
        return savedExpense;
      }

      if (localQueryRunner) {
        await localQueryRunner.commitTransaction();
      }

      return expense;
    } catch (error) {
      if (localQueryRunner) {
        await localQueryRunner.rollbackTransaction();
      }
      throw new BadRequestException(
        `Error occurred while creating expense: ${error.message}`,
      );
    } finally {
      if (localQueryRunner) {
        await localQueryRunner.release();
      }
    }
  }

  async bulkCreate(
    createExpenseDtos: CreateExpenseDto[],
    userId: string,
  ): Promise<Expense[]> {
    console.log('createExpenseDtos: ', createExpenseDtos);
    const queryRunner =
      this.expenseRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const expenses: Expense[] = [];
      for (const dto of createExpenseDtos) {
        const expense = await this.create(dto, userId, queryRunner);
        expenses.push(expense);
      }
      await queryRunner.commitTransaction();
      return expenses;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error occurred during bulk creation: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({
      relations: ['store', 'product', 'product.productDetails', 'createdBy'],
    });
  }

  async findOne(id: string): Promise<Expense> {
    return this.expenseRepository.findOne({ where: { id }, relations: ['store', 'product', 'product.productDetails', 'createdBy'] });
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new Error('Expense not found');
    }

    Object.assign(expense, updateExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new Error('Expense not found');
    }

    await this.expenseRepository.remove(expense);
  }

  async undoExpense(
    expenseId: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    console.log('Undoing expense...');

    let localQueryRunner: QueryRunner | null = null;
    if (!queryRunner) {
      localQueryRunner =
        this.expenseRepository.manager.connection.createQueryRunner();
      await localQueryRunner.connect();
      await localQueryRunner.startTransaction();
    }

    const runner = queryRunner || localQueryRunner;
    const expenseRepo = runner.manager;

    try {
      // Find the expense by its ID
      const expense = await expenseRepo.findOne(Expense, {
        where: { id: expenseId },
        relations: ['store', 'product'], // Load related entities for stock reversal
      });
      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      console.log('Found expense:', expense);

      // Handle stock reversal if the expense is INTERNAL
      if (expense.type === ExpenseType.INTERNAL) {
        if (!expense.product || !expense.quantity) {
          throw new BadRequestException(
            'Invalid product or quantity for reversal',
          );
        }

        const product = expense.product;
        const store = expense.store;
        const quantityToRevert = expense.quantity;

        // Call a method to revert stock batches affected by this expense
        const revertCost =
          await this.productsStockBatchService.revertStockBatches(
            product.id,
            quantityToRevert,
            store.id,
            runner,
          );

        console.log(
          `Reverted ${quantityToRevert} of product ${product.productDetails.name} stock`,
        );
      }

      // Remove the expense record
      await expenseRepo.remove(expense);

      console.log(`Expense with ID ${expenseId} successfully undone`);

      if (localQueryRunner) {
        await localQueryRunner.commitTransaction();
      }
    } catch (error) {
      if (localQueryRunner) {
        await localQueryRunner.rollbackTransaction();
      }
      throw new BadRequestException(
        `Error occurred while undoing expense: ${error.message}`,
      );
    } finally {
      if (localQueryRunner) {
        await localQueryRunner.release();
      }
    }
  }
}
