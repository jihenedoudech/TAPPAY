import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Equal,
  FindOptionsWhere,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ProductStockBatch } from './entities/product-stock-batch.entity';
import { ProductStockBatchDto } from './dto/product-batch-stock.dto';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductStore } from './entities/product-store.entity';
import { StockBatchOrigin } from './enums/stock-batch-origin.enum';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class ProductsStockBatchService {
  constructor(
    @InjectRepository(ProductStockBatch)
    private productStockBatchRepository: Repository<ProductStockBatch>,
    @InjectRepository(ProductStore)
    private productStoreRepository: Repository<ProductStore>,
    private suppliersService: SuppliersService,
  ) {}

  async retryTransaction<T>(
    retries: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await callback();
      } catch (error) {
        if (attempt === retries || error.code !== 'ER_LOCK_WAIT_TIMEOUT') {
          throw error;
        }
        console.log(`Retrying transaction (attempt ${attempt}/${retries})`);
        await this.delay(1000); // Optional: Add a delay before retrying
      }
    }
    throw new Error('All transaction retries failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async create(
    createProductStockBatchDto: ProductStockBatchDto,
    queryRunner: QueryRunner,
  ): Promise<ProductStockBatch> {
    return await this.retryTransaction(3, async () => {
      console.log('createProductStockBatchDto: ', createProductStockBatchDto);
      const { productStoreId, supplierId, ...batchData } =
        createProductStockBatchDto;

      // Ensure numeric values for originalStock and currentStock
      batchData.originalStock = Number(batchData.originalStock);
      batchData.currentStock = Number(batchData.currentStock);

      const productStore = await queryRunner.manager.findOne(ProductStore, {
        where: { id: productStoreId },
      });
      const supplier =
        await this.suppliersService.findOneWithoutRelations(supplierId);

      // Validate entity existence
      if (!productStore) {
        throw new Error(`Product not found for ID: ${productStoreId}`);
      }
      if (supplierId && !supplier) {
        throw new Error(`Supplier not found for ID: ${supplierId}`);
      }

      console.log('batchdata: ', batchData); // Should now show consistent types
      console.log('batch: ', {
        ...batchData,
        productStore,
        supplier,
      });

      // Create and save the stock batch
      const productStockBatch = queryRunner.manager.create(ProductStockBatch, {
        ...batchData,
        productStore,
        supplier,
      });
      console.log('productStockBatch: ', productStockBatch);

      return await queryRunner.manager.save(productStockBatch);
    });
  }

  async updateStockBatches(
    productId: string,
    quantity: number,
    storeId: string,
    queryRunner: QueryRunner,
    toStoreId?: string,
    origin?: StockBatchOrigin,
    originId?: string,
  ): Promise<number> {
    console.log('updating stock batches');
    console.log('Input params:', {
      productId,
      quantity,
      storeId,
      origin,
      originId,
      toStoreId,
    });
    console.log('productId: ', productId);

    const productStore = await this.productStoreRepository.findOne({
      where: { id: productId },
      relations: ['productDetails', 'store'],
    });
    if (!productStore) {
      throw new Error(`Product store not found for ID: ${productId}`);
    }

    const stockBatches = await this.productStockBatchRepository.find({
      where: {
        productStore: { id: productStore.id },
        currentStock: MoreThan(0),
      },
      order: { purchaseDate: 'ASC' },
      relations: ['productStore', 'supplier', 'productStore.store'],
    });
    if (!stockBatches || stockBatches.length === 0) {
      throw new Error(`No stock batches found for product ID: ${productId}`);
    }
    console.log('stock batches: ', stockBatches);

    let remainingQuantity = quantity;
    console.log('remainingQuantity: ', remainingQuantity);
    let totalCost = 0;
    const newBatchesData = [];

    for (const batch of stockBatches) {
      if (remainingQuantity <= 0) break;
      let movedQuantity = 0;
      if (batch.currentStock >= remainingQuantity) {
        console.log('first if');
        movedQuantity = remainingQuantity;
        totalCost += remainingQuantity * batch.costInclTax;
        batch.currentStock -= remainingQuantity;
        remainingQuantity = 0;
      } else {
        console.log('else');
        movedQuantity = batch.currentStock;
        totalCost += batch.currentStock * batch.costInclTax;
        remainingQuantity -= batch.currentStock;
        batch.currentStock = 0;
      }
      console.log('Processing batch: ', batch);
      await queryRunner.manager.save(batch);

      if (toStoreId) {
        // Look for an existing product store in the destination store
        let targetProductStore = await this.productStoreRepository.findOne({
          where: {
            store: { id: toStoreId },
            productDetails: { id: productStore.productDetails.id },
          },
        });
        console.log('targetProductStore: ', targetProductStore);
        // If not found, create a new one using the details from the from store
        if (!targetProductStore) {
          console.log('creating new product store');
          targetProductStore = this.productStoreRepository.create({
            sellingPrice: productStore.sellingPrice,
            productDetails: productStore.productDetails,
            store: { id: toStoreId }
          });
          await queryRunner.manager.save(targetProductStore);
          console.log('new product store created: ', targetProductStore);
        }

        newBatchesData.push({
          productStore: targetProductStore,
          store: { id: toStoreId },
          purchaseDate: batch.purchaseDate,
          costInclTax: batch.costInclTax,
          costExclTax: batch.costExclTax,
          tax: batch.tax,
          originalStock: movedQuantity,
          currentStock: movedQuantity,
          origin,
          originId, // Pass validated originId
          supplier: batch.supplier,
        });
      }
    }

    if (remainingQuantity > 0) {
      throw new Error(`Insufficient stock for the requested quantity`);
    }
    console.log('newBatchesData: ', newBatchesData);
    for (const newBatchData of newBatchesData) {
      console.log('Creating new batch:', newBatchData);
      const newBatch = this.productStockBatchRepository.create(newBatchData);
      await queryRunner.manager.save(newBatch);
    }

    console.log('stock batches updated');
    return totalCost;
  }

  async simpleUpdateStockBatch(
    batch: ProductStockBatch,
    queryRunner: QueryRunner,
  ): Promise<ProductStockBatch> {
    return queryRunner.manager.save(batch);
  }

  async findAll() {
    return this.productStockBatchRepository.find({
      relations: ['supplier', 'store'],
    });
  }

  async findOne(purchaseRecordId: string, productId: string, storeId: string) {
    return this.productStockBatchRepository.findOne({
      where: {
        // purchaseRecord: { id: purchaseRecordId },
        productStore: { id: productId },
      },
    });
  }

  async findAllRelatedToPurchaseItem(purchaseItemId: string) {
    console.log('purchaseItemId', purchaseItemId);
    return this.productStockBatchRepository.find({
      where: {
        origin: StockBatchOrigin.PURCHASE,
        originId: Equal(purchaseItemId),
      },
      relations: ['productStore', 'productStore.store'],
    });
  }

  async revertStockBatches(
    productId: string,
    quantity: number,
    fromStoreId: string,
    queryRunner: QueryRunner,
    toStoreId?: string,
    origin?: StockBatchOrigin,
    originId?: string,
  ) {
    console.log('Reverting stock batches');

    // If origin and originId are provided, handle stock movement reversal
    if (origin && originId) {
      // Existing logic for stock movement (same as before)
      const createdBatches = await queryRunner.manager.find(ProductStockBatch, {
        where: {
          productStore: { id: productId },
          origin,
          originId, // Ensure only batches linked to this movement are affected
        },
      });

      for (const batch of createdBatches) {
        const { purchaseDate, costInclTax, currentStock } = batch;

        // Find matching original batches in the `fromStore` with the same purchaseDate and cost
        const originalBatches = await queryRunner.manager.find(
          ProductStockBatch,
          {
            where: {
              productStore: { id: productId },
              purchaseDate, // Match the purchaseDate
              costInclTax, // Match the cost
            },
          },
        );

        if (!originalBatches || originalBatches.length === 0) {
          throw new Error(
            `Unable to find matching original batches for product ID: ${productId} with purchaseDate: ${purchaseDate} and cost: ${costInclTax}`,
          );
        }

        let remainingStockToRevert = currentStock;

        for (const originalBatch of originalBatches) {
          const availableSpace =
            originalBatch.originalStock - originalBatch.currentStock;

          if (availableSpace > 0) {
            const stockToRevert = Math.min(
              remainingStockToRevert,
              availableSpace,
            );

            originalBatch.currentStock += stockToRevert;
            remainingStockToRevert -= stockToRevert;

            await queryRunner.manager.save(originalBatch);

            if (remainingStockToRevert === 0) {
              break;
            }
          }
        }

        // If there's still stock left to revert, throw an error
        if (remainingStockToRevert > 0) {
          throw new Error(
            `Unable to revert stock fully for product ID: ${productId}. Excess stock could not be reverted to any original batch.`,
          );
        }

        // Remove the created batch
        await queryRunner.manager.remove(batch);
      }
    } else {
      // If origin and originId are not provided, it means the action is for an expense
      console.log(
        `Reverting quantity for product ID ${productId} due to expense`,
      );

      // Find the expense cost and quantity
      const expense = await queryRunner.manager.findOne(Expense, {
        where: { product: { id: productId } }, // assuming we can fetch the expense using productId
      });

      if (!expense) {
        throw new Error(`Expense for product ID ${productId} not found`);
      }

      const totalCost = expense.cost;
      const totalQuantity = expense.quantity; // Assuming the expense object has the `quantity` field
      const perUnitCost = totalCost / totalQuantity; // Calculate the cost per unit

      console.log(
        `Reverting stock for product ${productId} at a per unit cost of ${perUnitCost}`,
      );

      // Find stock batches in the `fromStore` with the closest costInclTax
      const batches = await queryRunner.manager.find(ProductStockBatch, {
        where: {
          productStore: { id: productId },
        },
        order: {
          costInclTax: 'ASC', // Sort batches by cost to find the closest match
        },
      });

      let remainingQuantity = quantity;

      for (const batch of batches) {
        // Only consider batches with a cost close enough to the per-unit cost
        const costDifference = Math.abs(batch.costInclTax - perUnitCost);

        if (costDifference < 0.01) {
          // Set tolerance level for cost match
          const availableStock = batch.originalStock - batch.currentStock;

          if (availableStock > 0) {
            const stockToReturn = Math.min(remainingQuantity, availableStock);

            batch.currentStock += stockToReturn;
            remainingQuantity -= stockToReturn;

            await queryRunner.manager.save(batch);

            if (remainingQuantity === 0) {
              break; // All quantity reverted
            }
          }
        }
      }

      // If there's still remaining quantity to revert and no batches left to revert to, throw an error
      if (remainingQuantity > 0) {
        throw new Error(
          `Unable to revert fully for product ID: ${productId}. Excess quantity could not be reverted to any matching batch.`,
        );
      }
    }

    console.log('Stock batches reverted');
  }
}
