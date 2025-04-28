import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PurchaseItem } from './entities/purchase-item.entity';
import { StockBatchOrigin } from '../products/enums/stock-batch-origin.enum';
import { PurchaseItemStore } from './entities/purchase-item-stores.entity';
import { ProductStockBatch } from '../products/entities/product-stock-batch.entity';
import { ProductsStockBatchService } from '../products/products-stock-batch.service';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';
import { Store } from '../stores/entities/store.entity';
import { ProductStore } from '../products/entities/product-store.entity';

@Injectable()
export class PurchaseItemsService {
  constructor(
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    private productsStockBatchService: ProductsStockBatchService,
    @InjectRepository(ProductStore)
    private productsStoreRepository: Repository<ProductStore>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findOneWithRelations(id: string) {
    return this.purchaseItemRepository.findOne({
      where: { id },
      relations: ['purchaseRecord'],
    });
  }

  async findOneWithoutRelations(id: string, queryRunner?: QueryRunner) {
    console.log('id inside findOneWithoutRelations: ', id);

    const repository = queryRunner
      ? queryRunner.manager.getRepository(PurchaseItem)
      : this.purchaseItemRepository;

    const purchaseItem = await repository.findOne({ where: { id } });
    console.log('purchaseItem inside findOneWithoutRelations: ', purchaseItem);

    if (!purchaseItem) {
      throw new Error('Purchase item not found');
    }
    return purchaseItem;
  }

  async findPurchaseRecordOfItem(id: string) {
    const purchaseItem = await this.purchaseItemRepository.findOne({ where: { id }, relations: ['purchaseRecord'] });
    return purchaseItem.purchaseRecord;
  }

  async updatePurchaseItem(
    id: string,
    updatePurchaseItemDto: UpdatePurchaseItemDto,
  ): Promise<PurchaseItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the existing purchase item
      const purchaseItem = await this.purchaseItemRepository.findOne({
        where: { id },
        relations: ['purchaseItemStores', 'purchaseRecord', 'productDetails'],
      });
      if (!purchaseItem) {
        throw new NotFoundException(`PurchaseItem with ID ${id} not found`);
      }
      console.log('purchaseItem: ', purchaseItem);
      // Update the purchase item fields
      purchaseItem.quantity = updatePurchaseItemDto.quantity;
      purchaseItem.priceExclTax = updatePurchaseItemDto.priceExclTax;
      purchaseItem.tax = updatePurchaseItemDto.tax;
      purchaseItem.priceInclTax = updatePurchaseItemDto.priceInclTax;
      purchaseItem.total = updatePurchaseItemDto.total;
      console.log('purchaseItem after update: ', purchaseItem);
      await queryRunner.manager.save(purchaseItem);

      // Update purchase item stores
      const updatedStoreIds = updatePurchaseItemDto.stores
        .filter((store) => store.id)
        .map((store) => store.id);

      for (const storeData of updatePurchaseItemDto.stores) {
        if (storeData.id) {
          const purchaseItemStore = purchaseItem.purchaseItemStores.find(
            (store) => store.id === storeData.id,
          );
          if (purchaseItemStore) {
            purchaseItemStore.quantity = storeData.quantity;
            await queryRunner.manager.save(purchaseItemStore);
          } else {
            throw new Error(
              `PurchaseItemStore with ID ${storeData.id} not found`,
            );
          }
          console.log('purchaseItemStore after update: ', purchaseItemStore);
        } else {
          const store = await queryRunner.manager.findOne(Store, {
            where: { id: storeData.storeId },
          });
          if (!store) {
            throw new Error(`Store with ID ${storeData.storeId} not found`);
          }
          const newPurchaseItemStore = queryRunner.manager.create(
            PurchaseItemStore,
            {
              purchaseItem,
              store,
              quantity: storeData.quantity,
            },
          );
          await queryRunner.manager.save(newPurchaseItemStore);
          console.log(
            'newPurchaseItemStore after update: ',
            newPurchaseItemStore,
          );
        }
      }

      // Delete purchase item stores that are not in the updatePurchaseItemDto
      const storesToDelete = purchaseItem.purchaseItemStores.filter(
        (store) => !updatedStoreIds.includes(store.id),
      );
      console.log('storesToDelete: ', storesToDelete);
      for (const store of storesToDelete) {
        console.log('deleting stores...');
        await queryRunner.manager.remove(store);
      }

      // Update stock batches
      const stockBatches =
        await this.productsStockBatchService.findAllRelatedToPurchaseItem(
          purchaseItem.id,
        );
      console.log('stockBatches: ', stockBatches);
      const updatedStoreStoreIds = updatePurchaseItemDto.stores.map(
        (store) => store.storeId,
      );

      for (const storeData of updatePurchaseItemDto.stores) {
        const stockBatch = stockBatches.find(
          (batch) => batch.productStore.store.id === storeData.storeId,
        );
        let productStore = await this.productsStoreRepository.findOne({
          where: {
            productDetails: { id: purchaseItem.productDetails.id },
            store: { id: storeData.storeId },
          },
        });
        if (!productStore) {
          console.log('Creating new ProductStore...');
          productStore = await this.productsStoreRepository.create({
            sellingPrice: storeData.sellingPrice || purchaseItem.priceInclTax * 1.1, // Default selling price calculation if not provided
            productDetails: purchaseItem.productDetails,
            store: { id: storeData.storeId },
          });
          productStore = await queryRunner.manager.save(productStore);
          console.log('New ProductStore created and saved:', productStore);
        }
        if (stockBatch) {
          const consumedQty =
            stockBatch.originalStock - stockBatch.currentStock;
          if (storeData.quantity < consumedQty) {
            throw new Error(
              `The store ${stockBatch.productStore.store.name} already consumed ${consumedQty} units of this product`,
            );
          }
          stockBatch.originalStock = storeData.quantity;
          stockBatch.currentStock = storeData.quantity - consumedQty;
          stockBatch.costExclTax = updatePurchaseItemDto.priceExclTax;
          stockBatch.tax = updatePurchaseItemDto.tax;
          stockBatch.costInclTax = updatePurchaseItemDto.priceInclTax;
          console.log('stockBatch after update: ', stockBatch);
          await queryRunner.manager.save(stockBatch);
        } else {
          console.log('Creating new StockBatch...');
          await this.productsStockBatchService.create(
            {
              productStoreId: productStore.id,
              originalStock: storeData.quantity,
              currentStock: storeData.quantity,
              costExclTax: updatePurchaseItemDto.priceExclTax,
              tax: updatePurchaseItemDto.tax,
              costInclTax: updatePurchaseItemDto.priceInclTax,
              purchaseDate: purchaseItem.purchaseRecord.date,
              supplierId: purchaseItem.purchaseRecord.supplier ? purchaseItem.purchaseRecord.supplier?.id : null,
              origin: StockBatchOrigin.PURCHASE,
              originId: purchaseItem.id,
            },
            queryRunner,
          ); 
        }
      }

      // Delete stock batches that are not in the updatePurchaseItemDto
      const batchesToDelete = stockBatches.filter(
        (batch) => !updatedStoreStoreIds.includes(batch.productStore.store.id),
      );
      console.log('batchesToDelete: ', batchesToDelete);
      for (const batch of batchesToDelete) {
        console.log('deleting batches...');
        if (batch.originalStock !== batch.currentStock) {
          throw new Error(
            `Cannot delete stock batch for store ${batch.productStore.store.id} because original stock is not equal to current stock`,
          );
        }
        await queryRunner.manager.remove(batch);
      }

      // Update the total of the purchase record
      const purchaseRecord = purchaseItem.purchaseRecord;
      console.log('purchaseRecord: ', purchaseRecord);
      const purchaseItems = await queryRunner.manager.find(PurchaseItem, {
        where: { purchaseRecord: { id: purchaseRecord.id } },
      });      
      const newTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
      purchaseRecord.total = newTotal;
      console.log('purchaseRecord after update: ', purchaseRecord);
      await queryRunner.manager.save(purchaseRecord);

      await queryRunner.commitTransaction();
      return purchaseItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating purchase item:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(purchaseItemId: string, queryRunner?: QueryRunner) {
    console.log('purchaseItemId: ', purchaseItemId);

    const isExternalTransaction = !!queryRunner;

    if (!queryRunner) {
      console.log('Creating query in item service');
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      // Find the purchase item
      const purchaseItem = await this.purchaseItemRepository.findOne({
        where: { id: purchaseItemId },
        relations: ['productDetails', 'purchaseRecord', 'purchaseItemStores'],
      });

      if (!purchaseItem) {
        throw new NotFoundException('Purchase item not found');
      }

      console.log('purchaseItem: ', purchaseItem);

      // Fetch related stock batches using the stock batch service
      const stockBatches =
        await this.productsStockBatchService.findAllRelatedToPurchaseItem(
          purchaseItem.id,
        );

      console.log('stockBatches: ', stockBatches);

      if (!stockBatches.length) {
        throw new Error('No stock batches found for the purchase item');
      }

      if (
        stockBatches.some((batch) => batch.originalStock !== batch.currentStock)
      ) {
        throw new BadRequestException('Stock has already been consumed');
      }

      // Delete stock batches
      await queryRunner.manager.remove(ProductStockBatch, stockBatches);

      // Delete purchase item stores
      await queryRunner.manager.remove(
        PurchaseItemStore,
        purchaseItem.purchaseItemStores,
      );

      // Delete the purchase item
      await queryRunner.manager.remove(PurchaseItem, purchaseItem);

      // Commit the transaction if it was created internally
      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return purchaseItem;
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
  }
}
