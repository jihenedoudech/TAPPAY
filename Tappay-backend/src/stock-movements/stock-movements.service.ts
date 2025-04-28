import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementItem } from './entities/stock-movement-item.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
import { StoresService } from '../stores/stores.service';
import { ProductsStockBatchService } from '../products/products-stock-batch.service';
import { UsersService } from '../users/users.service';
import { StockBatchOrigin } from '../products/enums/stock-batch-origin.enum';

@Injectable()
export class StockMovementsService {
  private readonly logger = new Logger(StockMovementsService.name);

  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(StockMovementItem)
    private stockMovementItemRepository: Repository<StockMovementItem>,
    private productsService: ProductsService,
    private productsStockBatchService: ProductsStockBatchService,
    private storesService: StoresService,
    private usersService: UsersService,
  ) {}

  async create(createDto: CreateStockMovementDto, userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { fromStoreId, toStoreId, movementDate, items, notes } = createDto;

    const fromStore = await this.storesService.findOne(fromStoreId);
    const toStore = await this.storesService.findOne(toStoreId);
    if (!fromStore || !toStore) {
      throw new NotFoundException('Invalid store IDs provided');
    }

    const queryRunner =
      this.stockMovementRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save stock movement to get the ID
      const stockMovement = this.stockMovementRepository.create({
        fromStore,
        toStore,
        movementDate,
        createdBy: user,
        notes,
      });
      console.log('Creating and saving stockMovement');
      await queryRunner.manager.save(stockMovement);

      console.log('Saved stockMovement: ', stockMovement);

      // Process items
      const stockMovementItems = await Promise.all(
        items.map(async (item) => {
          const product = await this.productsService.findProductStoreWithAvailableStock(
            item.productId,
            fromStore.id,
          );
          console.log('Found product: ', product);
          if (!product) {
            throw new NotFoundException(
              `Invalid product ID: ${item.productId}`,
            );
          }
          if (product.availableStock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product ${product.productDetails.name}`,
            );
          }

          await this.productsStockBatchService.updateStockBatches(
            item.productId,
            item.quantity,
            fromStore.id,
            queryRunner,
            toStore.id,
            StockBatchOrigin.MOVEMENT,
            stockMovement.id,
          );

          console.log('Creating stock movement item');
          return this.stockMovementItemRepository.create({
            product,
            quantity: item.quantity,
            notes: item.notes,
          });
        }),
      );

      console.log('Stock movement items: ', stockMovementItems);
      stockMovement.items = stockMovementItems;

      await queryRunner.manager.save(stockMovement);
      await queryRunner.commitTransaction();

      return stockMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error occurred while creating stock movement: ${error.message}`,
      );
      throw new BadRequestException(
        `Error occurred while creating stock movement: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async undoStockMovement(stockMovementId: string) {
    const stockMovement = await this.stockMovementRepository.findOne({
      where: { id: stockMovementId },
      relations: ['fromStore', 'toStore', 'items', 'items.product'],
    });

    if (!stockMovement) {
      throw new NotFoundException(
        `Stock movement not found with ID: ${stockMovementId}`,
      );
    }

    const queryRunner =
      this.stockMovementRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of stockMovement.items) {
        // Revert stock batches for each item
        await this.productsStockBatchService.revertStockBatches(
          item.product.id,
          item.quantity,
          stockMovement.fromStore.id,
          queryRunner,
          stockMovement.toStore.id,
          StockBatchOrigin.MOVEMENT,
          stockMovement.id,
        );
      }

      await queryRunner.manager.remove(stockMovement);

      await queryRunner.commitTransaction();
      return {
        message: `Stock movement with ID ${stockMovementId} has been undone.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error occurred while undoing stock movement: ${error.message}`,
      );
      throw new BadRequestException(
        `Error occurred while undoing stock movement: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      relations: [
        'fromStore',
        'toStore',
        'items',
        'items.product',
        'items.product.productDetails',
        'createdBy',
      ],
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    return this.stockMovementRepository.findOneOrFail({
      where: { id },
      relations: ['fromStore', 'toStore', 'items', 'items.product', 'items.product.productDetails', 'createdBy'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.stockMovementRepository.delete(id);
  }
}
