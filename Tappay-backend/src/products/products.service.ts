// src/products/products.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDetails } from './entities/product-details.entity';
import {
  DataSource,
  Equal,
  In,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { ProductStockBatch } from './entities/product-stock-batch.entity';
import { ProductStore } from './entities/product-store.entity';
import { Barcode } from './entities/barcode.entity';
import { PriceTier } from './entities/price-tier.entity';
import { ProductDetailsDto } from './dto/product-details.dto';
import { ProductStoreDto } from './dto/product-store.dto';
import { ProductComponent } from './entities/component.entity';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductStore)
    private productStoreRepository: Repository<ProductStore>,
    @InjectRepository(ProductDetails)
    private productDetailsRepository: Repository<ProductDetails>,
    @InjectRepository(ProductComponent)
    private productComponentRepository: Repository<ProductComponent>,
    @InjectRepository(ProductStockBatch)
    private productStockBatchRepository: Repository<ProductStockBatch>,
    private dataSource: DataSource,
  ) {}

  async saveProductStore(
    productStoreDto: ProductStoreDto,
  ): Promise<ProductStore> {
    console.log('productStore', productStoreDto);
    const productStore = this.productStoreRepository.create(productStoreDto);

    if (!productStoreDto.storeId) {
      throw new BadRequestException('Store ID is required');
    } else {
      productStore.store = {
        id: productStoreDto.storeId,
      } as Store;
    }

    if (!productStoreDto.productDetailsId) {
      throw new BadRequestException('Product Details ID is required');
    } else {
      productStore.productDetails = {
        id: productStoreDto.productDetailsId,
      } as ProductDetails;
    }

    return await this.productStoreRepository.save(productStore);
  }

  async saveProductDetails(
    dto: ProductDetailsDto,
    queryRunner?: QueryRunner,
  ): Promise<ProductDetails> {
    let localQueryRunner = false;
    if (!queryRunner) {
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      localQueryRunner = true;
    }

    try {
      const { id, barcodes, components, ...productDetailsData } = dto;
      let existingProductDetails: ProductDetails | undefined;

      if (id) {
        existingProductDetails = await queryRunner.manager.findOne(
          ProductDetails,
          {
            where: { id },
            relations: ['barcodes'],
          },
        );

        if (!existingProductDetails) {
          throw new NotFoundException(`ProductDetails with ID ${id} not found`);
        }
      }

      const existingBarcodes = existingProductDetails?.barcodes || [];
      const newBarcodes =
        barcodes?.filter(
          (barcode) =>
            !existingBarcodes.some(
              (existing) => existing.barcode === barcode.barcode,
            ),
        ) || [];
      const newBarcodeEntities = newBarcodes.map((barcode) =>
        queryRunner.manager.create(Barcode, { barcode: barcode.barcode }),
      );

      const mergedBarcodes = [...existingBarcodes, ...newBarcodeEntities];
      const productDetails = queryRunner.manager.create(ProductDetails, {
        id,
        ...productDetailsData,
        barcodes: mergedBarcodes,
      });

      const savedProductDetails =
        await queryRunner.manager.save(productDetails);

      // Process components if any were sent in the DTO
      if (components && components.length > 0) {
        // This array will hold the new ProductComponent entities
        const productComponentEntities: ProductComponent[] = [];

        for (const componentDto of components) {
          const componentProduct = await queryRunner.manager.findOne(
            ProductDetails,
            {
              where: { id: componentDto.ProductId },
            },
          );
          if (!componentProduct) {
            throw new NotFoundException(
              `Component Product with id ${componentDto.ProductId} not found`,
            );
          }
          componentProduct.type = componentDto.type;
          await queryRunner.manager.save(componentProduct);
          const productComponent = queryRunner.manager.create(
            ProductComponent,
            {
              finalProduct: savedProductDetails,
              componentProduct: componentProduct,
              qty: componentDto.qty,
            },
          );
          productComponentEntities.push(productComponent);
        }
        savedProductDetails.components = productComponentEntities;
        await queryRunner.manager.save(savedProductDetails);
      }

      if (localQueryRunner) {
        await queryRunner.commitTransaction();
      }

      return savedProductDetails;
    } catch (error) {
      if (localQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (localQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  // async update(id: string, updateProductDto: UpdateProductDto) {
  //   const product = await this.productRepository.findOne({where: {id}})
  //   if (!product) {
  //     throw new NotFoundException(`Product with ID ${id} not found or removed`);
  //   }
  //   await this.productRepository.update(id, updateProductDto);
  //   return await this.productRepository.findOne({where: {id}})
  // }

  //Find all products with stock batches in all stores for admin
  async findAllDetails() {
    return await this.productDetailsRepository.find({
      relations: [
        'category',
        'barcodes',
        'components',
        'productStores',
        'productStores.store',
        'productStores.stockBatches',
        'productStores.pricingTiers',
      ],
      where: { deletedAt: null },
    });
  }

  //Find all products with stock batches in a specific store for admin
  async findAllInStore(storeId: string) {
    const products = await this.productStoreRepository.find({
      relations: [
        'store',
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'stockBatches',
        'pricingTiers',
        'parent',
      ],
      where: { isRemovedAt: null, store: { id: storeId } },
    });
    return products.map((product) => ({
      ...product,
      availableStock: this.calculateAvailableStockInStore(product),
    }));
  }

  async findAllAcrossStores(userId: string): Promise<any[]> {
    const productStores = await this.productStoreRepository.find({
      relations: [
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'productDetails.components',
        'productDetails.components.componentProduct',
        'productDetails.parent',
        'stockBatches',
        'stockBatches.supplier',
        'pricingTiers',
        'store',
      ],
      where: { isRemovedAt: null, store: { users: { id: userId } } },
    });

    const productDetailsMap = new Map<string, any>();

    productStores.forEach((productStore) => {
      const productDetailsId = productStore.productDetails.id;
      if (!productDetailsMap.has(productDetailsId)) {
        productDetailsMap.set(productDetailsId, {
          productDetails: productStore.productDetails,
          storeDetails: [],
        });
      }

      const storeDetails = {
        id: productStore.id,
        store: productStore.store,
        sellingPrice: productStore.sellingPrice,
        minimumSalePrice: productStore.minimumSalePrice,
        pricingTiers: productStore.pricingTiers,
        stockAlertLevel: productStore.stockAlertLevel,
        discountType: productStore.discountType,
        discountAmount: productStore.discountAmount,
        loyaltyPointsEarned: productStore.loyaltyPointsEarned,
        loyaltyPointsRedeemed: productStore.loyaltyPointsRedeemed,
        availableStock: this.calculateAvailableStockInStore(productStore),
        stockBatches: productStore.stockBatches,
        salesCount: productStore.salesCount,
      };

      productDetailsMap.get(productDetailsId).storeDetails.push(storeDetails);
    });

    // Fetch all product details with the needed relations.
    const allProductDetails = await this.productDetailsRepository.find({
      relations: [
        'category',
        'barcodes',
        'components',
        'components.componentProduct',
        'parent',
        'productStores', // to identify if there are associated stores
      ],
    });

    // Filter out products that do not have any associated productStores.
    const productsWithoutStores = allProductDetails.filter(
      (pd) => !pd.productStores || pd.productStores.length === 0,
    );

    productsWithoutStores.forEach((productDetails) => {
      if (!productDetailsMap.has(productDetails.id)) {
        productDetailsMap.set(productDetails.id, {
          productDetails,
          storeDetails: [],
        });
      }
    });

    console.log('products without stores', productsWithoutStores);

    return Array.from(productDetailsMap.values());
  }

  //Find all products without stock batches in a store for cashier
  async findAllLimitedInStore(storeId: string) {
    const products = await this.productStoreRepository.find({
      relations: [
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'stockBatches',
        'pricingTiers',
        'parent',
      ],
      where: { isRemovedAt: null, store: { id: storeId } },
    });

    return products.map((product) => {
      const availableStock = this.calculateAvailableStockInStore(product);
      const { stockBatches, ...productWithoutStockBatches } = product;
      return { ...productWithoutStockBatches, availableStock };
    });
  }

  async findOneNotRemoved(id: string) {
    const product = await this.productStoreRepository.findOne({
      where: { id, isRemovedAt: null },
      relations: [
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'stockBatches',
        'pricingTiers',
      ],
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async findOne(id: string) {
    const product = await this.productStoreRepository.findOne({
      where: { id, isRemovedAt: null },
      relations: [
        'productDetails',
        'productDetails.barcodes',
        'productDetails.category',
        'productDetails.components',
        'pricingTiers',
        'stockBatches',
        'store',
        'parent',
        'parent.productDetails',
      ],
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    const availableStock = this.calculateAvailableStockInStore(product);
    return {
      ...product,
      availableStock,
    };
  }

  async findProductStoreForComponent(id: string, storeId: string) {
    const productComponent = await this.productComponentRepository.findOne({
      where: { id },
      relations: ['finalProduct', 'componentProduct'],
    });
    const productStore = await this.productStoreRepository.findOne({
      where: {
        productDetails: { id: productComponent.componentProduct.id },
        store: { id: storeId },
      },
      relations: ['productDetails', 'stockBatches'],
    });
    return productStore;
  }

  async findOneLimited(id: string) {
    const product = await this.productStoreRepository.findOne({
      where: { id, isRemovedAt: null },
      relations: ['stockBatches'], // Ensure stockBatches is loaded
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const availableStock = this.calculateAvailableStockInStore(product);
    return {
      id: product.id,
      name: product.productDetails.name,
      sellingPrice: product.sellingPrice,
      availableStock,
    };
  }

  async findByBarcode(barcode: string): Promise<ProductStore> {
    return this.productStoreRepository.findOne({
      where: { isRemovedAt: null, productDetails: { barcodes: { barcode } } },
      relations: [
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'stockBatches',
        'pricingTiers',
      ],
    });
  }

  async findByBarcodes(barcodes: string[]): Promise<ProductStore[]> {
    return this.productStoreRepository.find({
      where: {
        isRemovedAt: null,
        productDetails: { barcodes: { barcode: In(barcodes) } },
      },
      relations: [
        'productDetails',
        'productDetails.category',
        'productDetails.barcodes',
        'stockBatches',
        'pricingTiers',
      ],
    });
  }

  async findOneWithAvailableStock(productDetailsId: string, storeId: string) {
    const product = await this.productStoreRepository.findOne({
      where: {
        productDetails: { id: productDetailsId },
        isRemovedAt: null,
        store: { id: storeId },
      },
      relations: [
        'productDetails',
        'productDetails.barcodes',
        'productDetails.category',
        'pricingTiers',
        'stockBatches',
      ],
    });
    if (!product)
      throw new NotFoundException(
        `Product with ID ${productDetailsId} not found`,
      );
    const availableStock = this.calculateAvailableStockInStore(product);
    return {
      ...product,
      availableStock,
    };
  }

  async findProductStoreWithAvailableStock(productStoreId: string, storeId: string) {
    const product = await this.productStoreRepository.findOne({
      where: { id: productStoreId, store: { id: storeId } },
      relations: ['productDetails', 'stockBatches', 'store'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productStoreId} not found`);
    }
    const availableStock = this.calculateAvailableStockInStore(product);
    return {
      ...product,
      availableStock,
    };
  }

  async remove(id: string): Promise<void> {
    const product = await this.productStoreRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.orderItems.length === 0) {
      await this.productStoreRepository.delete(id);
    } else {
      await this.productStoreRepository.manager.transaction(
        async (transactionManager) => {
          await transactionManager.update(ProductStore, id, {
            isRemovedAt: new Date(),
          });
          await transactionManager
            .createQueryBuilder()
            .update(OrderItem)
            .set({ productIsRemoved: true })
            .where('productId = :id', { id })
            .execute();
        },
      );
    }
  }

  calculateAvailableStockInStore(productStore: ProductStore): number {
    return productStore.stockBatches.reduce(
      (sum, batch) => sum + batch.currentStock,
      0,
    );
  }

  async calculateAvailableStockInAllStores(
    productDetailsId: string,
  ): Promise<number> {
    const productStockBatches = await this.productStockBatchRepository.find({
      where: {
        productStore: { productDetails: { id: productDetailsId } },
        currentStock: MoreThan(0),
      },
      relations: ['productStore', 'productStore.productDetails'],
    });
    return productStockBatches.reduce(
      (sum, batch) => sum + batch.currentStock,
      0,
    );
  }

  //Stock batches methods

  findProductStockBatchesFifo(
    productStoreId: string,
  ): Promise<ProductStockBatch[]> {
    return this.productStockBatchRepository.find({
      where: {
        productStore: { id: productStoreId },
        currentStock: MoreThan(0),
      },
      order: { purchaseDate: 'ASC' },
      relations: ['supplier'],
    });
  }

  findProductStockBatchesLifo(
    productStoreId: string,
  ): Promise<ProductStockBatch[]> {
    return this.productStockBatchRepository.find({
      where: { productStore: { id: productStoreId }, currentStock: Equal(0) },
      order: { purchaseDate: 'DESC' },
    });
  }

  save(productStockBatch: ProductStockBatch): Promise<ProductStockBatch> {
    return this.productStockBatchRepository.save(productStockBatch);
  }
}
