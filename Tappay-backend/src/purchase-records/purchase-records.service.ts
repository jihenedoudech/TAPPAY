import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseRecordDto } from './dto/create-purchase-record.dto';
import { UpdatePurchaseRecordDto } from './dto/update-purchase-record.dto';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsStockBatchService } from '../products/products-stock-batch.service';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { ProductStore } from '../products/entities/product-store.entity';
import { PurchaseItemStore } from './entities/purchase-item-stores.entity';
import { Store } from '../stores/entities/store.entity';
import { StockBatchOrigin } from '../products/enums/stock-batch-origin.enum';
import { UsersService } from '../users/users.service';
import { PurchaseItemsService } from './purchase-items.service';

@Injectable()
export class PurchaseRecordsService {
  constructor(
    @InjectRepository(PurchaseRecord)
    private purchaseRecordRepository: Repository<PurchaseRecord>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    private purchaseItemsService: PurchaseItemsService,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
    @Inject(forwardRef(() => ProductsStockBatchService))
    private productsStockBatchService: ProductsStockBatchService,
    private dataSource: DataSource,
    private usersService: UsersService,
    @InjectRepository(ProductStore)
    private productsStoreRepository: Repository<ProductStore>,
  ) {}

  async create(
    createPurchaseRecordDto: CreatePurchaseRecordDto,
    userId: string,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const supplier = await queryRunner.manager.findOne(Supplier, {
        where: { id: createPurchaseRecordDto.supplierId },
      });
      console.log('Supplier:', supplier);
  
      // Create and save the purchase record
      const purchaseRecord = this.purchaseRecordRepository.create({
        ...createPurchaseRecordDto,
        supplier,
        purchasedItems: [],
        createdBy: user,
      });
      const savedPurchaseRecord = await queryRunner.manager.save(purchaseRecord);
      console.log('Saved Purchase Record:', savedPurchaseRecord);
  
      // Map to keep track of created product details and stores
      const productDetailsMap = new Map();
      const productStoreMap = new Map();
  
      // Process each purchased item
      for (const item of createPurchaseRecordDto.purchasedItems) {
        const { productDetails, stores, ...rest } = item;
        productDetails.brand = supplier?.brand;
        console.log('Processing Product Details:', productDetails);
  
        // Save product details
        const savedProductDetails = await this.productsService.saveProductDetails(
          productDetails,
          queryRunner,
        );
        if (!savedProductDetails) {
          throw new Error('Failed to save product details');
        }
        console.log('Saved Product Details:', savedProductDetails);
  
        // Store the product details in the map
        productDetailsMap.set(item.localId, savedProductDetails);
  
        // If the item is a child, link it to its parent
        if (item.isChild) {
          const parentProductDetails = productDetailsMap.get(item.parentLocalId);
          if (parentProductDetails) {
            savedProductDetails.parent = parentProductDetails;
            await queryRunner.manager.save(savedProductDetails);
            console.log('Linked Child Product Details to Parent:', savedProductDetails);
          }
        }
  
        // Only create purchase items and stock batches for packs
        if (!item.isChild) {
          const purchaseItem = this.purchaseItemRepository.create({
            ...rest,
            purchaseRecord: savedPurchaseRecord,
            productDetails: savedProductDetails,
          });
          const savedPurchaseItem = await queryRunner.manager.save(purchaseItem);
          console.log('Saved Purchase Item:', savedPurchaseItem);
  
          for (const storeData of item.stores) {
            const store = await queryRunner.manager.findOne(Store, {
              where: { id: storeData.storeId },
            });
            if (!store) {
              throw new Error(`Store with ID ${storeData.storeId} not found`);
            }
  
            if (!storeData.quantity || storeData.quantity <= 0) {
              throw new Error(`Quantity for store ${store.name} is invalid`);
            }
  
            const purchaseItemStore = queryRunner.manager.create(
              PurchaseItemStore,
              {
                purchaseItem: savedPurchaseItem,
                store: store,
                quantity: storeData.quantity,
              },
            );
            await queryRunner.manager.save(purchaseItemStore);
            console.log('Saved Purchase Item Store:', purchaseItemStore);
  
            let product = await this.productsStoreRepository.findOne({
              where: {
                productDetails: { id: savedProductDetails.id },
                store: { id: store.id },
              },
            });
  
            if (!product) {
              console.log('Creating new Product Store entry');
              product = await this.productsStoreRepository.create({
                sellingPrice: storeData.sellingPrice || item.priceInclTax * 1.1,
                minimumSalePrice: item.priceInclTax,
                productDetails: savedProductDetails,
                store: store,
              });
              product = await queryRunner.manager.save(product);
              console.log('Saved Product Store:', product);
            } else {
              let isUpdated = false;
              if (product.sellingPrice !== storeData.sellingPrice) {
                await queryRunner.manager
                  .createQueryBuilder()
                  .update(ProductStore)
                  .set({ sellingPrice: storeData.sellingPrice })
                  .where('id = :id', { id: product.id })
                  .execute();
                console.log('Updated Product Store Selling Price');
                isUpdated = true;
              }
  
              if (isUpdated) {
                console.log('Product Store Updated:', product);
              }
            }
  
            // Store the product store in the map
            productStoreMap.set(item.localId, product);
  
            await this.productsStockBatchService.create(
              {
                productStoreId: product.id,
                originalStock: storeData.quantity,
                currentStock: storeData.quantity,
                costExclTax: item.priceExclTax,
                tax: item.tax,
                costInclTax: item.priceInclTax,
                purchaseDate: purchaseRecord.date,
                supplierId: supplier ? supplier?.id : null,
                origin: StockBatchOrigin.PURCHASE,
                originId: savedPurchaseItem.id,
              },
              queryRunner,
            );
            console.log('Created Stock Batch');
          }
        }
      }
  
      // Link child product stores to their parent
      for (const item of createPurchaseRecordDto.purchasedItems) {
        if (item.isChild) {
          const parentProductStore = productStoreMap.get(item.parentLocalId);
          const childProductDetails = productDetailsMap.get(item.localId);
  
          if (parentProductStore && childProductDetails) {
            for (const storeData of item.stores) {
              const store = await queryRunner.manager.findOne(Store, {
                where: { id: storeData.storeId },
              });
              if (!store) {
                throw new Error(`Store with ID ${storeData.storeId} not found`);
              }
  
              let childProductStore = await this.productsStoreRepository.findOne({
                where: {
                  productDetails: { id: childProductDetails.id },
                  store: { id: store.id },
                },
              });
  
              if (!childProductStore) {
                childProductStore = await this.productsStoreRepository.create({
                  sellingPrice: storeData.sellingPrice || item.priceInclTax * 1.1,
                  productDetails: childProductDetails,
                  store: store,
                  parent: parentProductStore,
                });
                childProductStore = await queryRunner.manager.save(childProductStore);
                console.log('Saved Child Product Store:', childProductStore);
              } else {
                childProductStore.parent = parentProductStore;
                await queryRunner.manager.save(childProductStore);
                console.log('Updated Child Product Store with Parent:', childProductStore);
              }
            }
          }
        }
      }
  
      await queryRunner.commitTransaction();
      console.log('Transaction Committed');
      return savedPurchaseRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating purchase record:', error);
      throw error;
    } finally {
      await queryRunner.release();
      console.log('Query Runner Released');
    }
  }  
  
  findAll() {
    return this.purchaseRecordRepository.find({
      relations: [
        'supplier',
        'purchasedItems',
        'purchasedItems.purchaseItemStores.store',
        'purchasedItems.productDetails',
      ],
      order: {
        date: 'DESC',
      },
    });
  }

  findOneWithRelations(id: string) {
    return this.purchaseRecordRepository.findOne({
      where: { id },
      relations: [
        'supplier',
        'purchasedItems',
        'purchasedItems.purchaseItemStores.store',
        'purchasedItems.productDetails',
      ],
    });
  }

  findOneWithoutRelations(id: string) {
    return this.purchaseRecordRepository.findOne({ where: { id } });
  }

  private async calculateQuantitiesInItem(item: PurchaseItem) {

    // Fetch all stock batches related to the purchase item
    const stockBatches =
      await this.productsStockBatchService.findAllRelatedToPurchaseItem(
        item.id,
      );

    // Object to store current quantity and name for each store (keyed by store ID)
    const storeQuantities: Record<
      string,
      { storeName: string; currentStock: number }
    > = {};
    let totalCurrentQuantity = 0;

    // Iterate over the stock batches
    for (const stockBatch of stockBatches) {
      const storeId = stockBatch.productStore.store.id; // Unique store ID
      const storeName = stockBatch.productStore.store.name; // Store name
      const currentStock = stockBatch.currentStock;

      // Add current stock to the total
      totalCurrentQuantity += currentStock;

      // Add or update the store's stock quantity and name
      if (storeQuantities[storeId]) {
        storeQuantities[storeId].currentStock += currentStock;
      } else {
        storeQuantities[storeId] = {
          storeName,
          currentStock,
        };
      }
    }

    // Return an object with store-level and total quantities
    return {
      storeQuantities, // Object with current quantities and names keyed by store ID
      totalCurrentQuantity, // Total current stock across all stores
    };
  }

  async findOneWithCurrentQuantities(id: string) {
    const purchaseRecord = await this.findOneWithRelations(id);
    if (!purchaseRecord) {
      throw new NotFoundException('Purchase record not found');
    }
    const itemsWithCurrentQuantities = await Promise.all(
      purchaseRecord.purchasedItems.map(async (item) => {
        const quantities = await this.calculateQuantitiesInItem(item);
        return {
          ...item, // Keep all existing properties of the item
          currentQuantities: quantities, // Add the calculated quantities
        };
      }),
    );
    return {
      ...purchaseRecord,
      purchasedItems: itemsWithCurrentQuantities,
    };
  }

  async updateCommonData(
    id: string,
    updatePurchaseRecordDto: UpdatePurchaseRecordDto,
  ): Promise<PurchaseRecord> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Find the existing purchase record
      const purchaseRecord = await this.purchaseRecordRepository.findOne({
        where: { id },
        relations: ['supplier', 'purchasedItems'], // Include supplier and purchasedItems
      });
  
      if (!purchaseRecord) {
        throw new NotFoundException(`PurchaseRecord with ID ${id} not found`);
      }
  
      // Track whether the date or supplier is being updated
      const isDateUpdated = updatePurchaseRecordDto.date !== undefined;
      const isSupplierUpdated = updatePurchaseRecordDto.supplierId !== undefined;
  
      // Update the supplier if provided
      if (isSupplierUpdated) {
        const supplier = await queryRunner.manager.findOne(Supplier, {
          where: { id: updatePurchaseRecordDto.supplierId },
        });
  
        if (!supplier) {
          throw new NotFoundException(
            `Supplier with ID ${updatePurchaseRecordDto.supplierId} not found`,
          );
        }
  
        purchaseRecord.supplier = supplier;
      }
  
      // Update the date if provided
      if (isDateUpdated) {
        purchaseRecord.date = updatePurchaseRecordDto.date;
      }
  
      // Save the updated purchase record
      const updatedPurchaseRecord = await queryRunner.manager.save(
        purchaseRecord,
      );
  
      // If either the date or supplier was updated, update related stock batches
      if (isDateUpdated || isSupplierUpdated) {
        for (const item of purchaseRecord.purchasedItems) {
          const stockBatches =
            await this.productsStockBatchService.findAllRelatedToPurchaseItem(
              item.id,
            );
  
          // Update the stock batches
          for (const stockBatch of stockBatches) {
            if (isSupplierUpdated) {
              stockBatch.supplier = purchaseRecord.supplier;
            }
            if (isDateUpdated) {
              stockBatch.purchaseDate = purchaseRecord.date;
            }
            await queryRunner.manager.save(stockBatch);
          }
        }
      }
  
      await queryRunner.commitTransaction();
      return updatedPurchaseRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating purchase record:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  update(id: string, updatePurchaseRecordDto: UpdatePurchaseRecordDto) {
    // return this.purchaseRecordRepository.update(id, updatePurchaseRecordDto);
    return 'this updates the purchase record';
  }

  async delete(purchaseRecordId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseRecord = await this.purchaseRecordRepository.findOne({
        where: { id: purchaseRecordId },
        relations: ['purchasedItems'],
      });

      if (!purchaseRecord) {
        throw new NotFoundException('Purchase record not found');
      }

      for (const purchaseItem of purchaseRecord.purchasedItems) {
        await this.purchaseItemsService.delete(purchaseItem.id, queryRunner);
      }

      await queryRunner.manager.remove(PurchaseRecord, purchaseRecord);

      await queryRunner.commitTransaction();
      return purchaseRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
