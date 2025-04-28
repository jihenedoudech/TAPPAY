import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import {
  Between,
  DataSource,
  In,
  MoreThan,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from './enums/order.enum';
import { OrderItemStatus } from './enums/order-item.enum';
import { ShiftsService } from '../shifts/shifts.service';
import { ProductsService } from '../products/products.service';
import { RefundItemDto } from './dto/refund-item.dto';
import { Role } from '../auth/enums/role.enum';
import { ProductStore } from '../products/entities/product-store.entity';
import { StockBatchOrigin } from '../products/enums/stock-batch-origin.enum';
import { ProductsStockBatchService } from '../products/products-stock-batch.service';
import { ProductStockBatch } from '../products/entities/product-stock-batch.entity';
import { ProductType } from 'src/products/enums/product-type.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    @Inject(forwardRef(() => ShiftsService))
    private shiftsService: ShiftsService,
    private dataSource: DataSource,
    private productsStockBatchService: ProductsStockBatchService,
  ) {}

  async openChildBatchFromParent(
    product: ProductStore,
    queryRunner: QueryRunner,
  ): Promise<ProductStockBatch> {
    // Get parent's batch (FIFO)
    const parentBatches =
      await this.productsService.findProductStockBatchesFifo(product.parent.id);
    console.log('parentBatches: ', parentBatches);
    if (!parentBatches.length) {
      throw new Error(
        `Not enough stock in parent pack for product ${product.productDetails.name}.`,
      );
    }
    // Assume we take one whole pack
    const parentBatch = parentBatches[0];
    if (parentBatch.currentStock < 1) {
      throw new Error(
        `Not enough pack stock available in parent for product ${product.productDetails.name}.`,
      );
    }
    // Decrement parent's stock by 1 pack
    parentBatch.currentStock -= 1;
    console.log('parentBatch: ', parentBatch);
    const savedParentBatch =
      await this.productsStockBatchService.simpleUpdateStockBatch(
        parentBatch,
        queryRunner,
      );
    console.log('savedParentBatch: ', savedParentBatch);

    // Create a new child stock batch representing the opened pack
    const piecesPerPack = product.parent.productDetails.piecesPerPack;
    const costPerSet = parentBatch.costInclTax / piecesPerPack;
    console.log('costPerSet: ', costPerSet);
    const newChildBatch = await this.productsStockBatchService.create(
      {
        productStoreId: product.id,
        originalStock: piecesPerPack,
        currentStock: piecesPerPack,
        costExclTax: costPerSet, // adjust as needed (and tax calculation)
        tax: parentBatch.tax / piecesPerPack,
        costInclTax: costPerSet, // adjust if needed
        purchaseDate: parentBatch.purchaseDate,
        supplierId: parentBatch.supplier.id || null,
        origin: StockBatchOrigin.PURCHASE,
        originId: parentBatch.originId,
      },
      queryRunner,
    );
    console.log('newChildBatch: ', newChildBatch);
    return newChildBatch;
  }

  async createOrderDraft(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('createOrderDto: ', createOrderDto);
      const orderItems = createOrderDto.purchasedItems.map((itemDto) => ({
        ...itemDto,
        total: itemDto.quantity * itemDto.sellingPrice,
        product: { id: itemDto.productId },
        status: OrderItemStatus.PENDING,
      }));
      console.log('order items: ', orderItems);
      let totalCost = 0;
      let totalProfit = 0;
      for (const item of orderItems) {
        const product = await this.productsService.findOne(item.product.id);
        console.log('product: ', product);
        const productStockBatches =
          await this.productsService.findProductStockBatchesFifo(product.id);
        let remainingQuantity = item.quantity;
        const isSet = !!product.parent;

        let itemCost = 0;
        let itemProfit = 0;

        if (product.productDetails.type === ProductType.TRANSFORMED) {
          if (
            !product.productDetails.components ||
            product.productDetails.components.length === 0
          ) {
            throw new Error(
              `Final product ${product.productDetails.name} does not have defined components.`,
            );
          }
          let totalComponentsCost = 0;
          for (const component of product.productDetails.components) {
            const productStoreForComponent =
              await this.productsService.findProductStoreForComponent(
                component.id,
                product.store.id,
              );
            console.log('productStoreForComponent: ', productStoreForComponent);
            console.log('component qty: ', component.qty);
            const compStockBatches =
              await this.productsService.findProductStockBatchesFifo(
                productStoreForComponent.id,
              );
            console.log('compStockBatches: ', compStockBatches);
            let compRemainingQty = item.quantity * component.qty;
            let compCost = 0;
            // Allocate required quantity from FIFO batches
            for (const batch of compStockBatches) {
              if (compRemainingQty <= 0) break;
              const available = batch.currentStock;
              const qtyToUse = Math.min(compRemainingQty, available);
              compRemainingQty -= qtyToUse;
              compCost += batch.costInclTax * qtyToUse;
            }
            if (compRemainingQty > 0) {
              throw new Error(
                `Not enough stock for component ${productStoreForComponent.productDetails.name}.`,
              );
            }
            totalComponentsCost += compCost;
            console.log('totalComponentsCost: ', totalComponentsCost);
            console.log('compCost: ', compCost);
          }
          // The final product's cost is the sum of its component costs.
          itemCost = totalComponentsCost;
          const sellingPrice = item.sellingPrice || product.sellingPrice;
          // Profit/margin is (selling price minus total component cost) multiplied by the order quantity.
          itemProfit = sellingPrice * item.quantity - totalComponentsCost;
          console.log('itemProfit: ', itemProfit);
          console.log('itemCost: ', itemCost);
          remainingQuantity = 0;
        } else if (isSet) {
          console.log('product: ', product);
          // Try to get an existing open child batch (FIFO)
          let childBatches =
            await this.productsService.findProductStockBatchesFifo(product.id);
          console.log('childBatches: ', childBatches);

          // If no open child batch is found, "open" a new pack from parent's stock:
          if (!childBatches.length) {
            const newChildBatch = await this.openChildBatchFromParent(
              product,
              queryRunner,
            );
            // Use this new batch as the starting point for allocations
            childBatches = [newChildBatch];
          }

          // Now allocate from the available child batches:
          for (const batch of childBatches) {
            if (remainingQuantity <= 0) break;
            const available = batch.currentStock;
            const qtyToUse = Math.min(remainingQuantity, available);
            remainingQuantity -= qtyToUse;
            itemCost += batch.costInclTax * qtyToUse;
            // For profit: compare against selling price of the set (as set price is defined on the child)
            const sellingPrice = item.sellingPrice || product.sellingPrice;
            itemProfit += (sellingPrice - batch.costInclTax) * qtyToUse;
          }

          // If there's still remaining quantity, try opening new child batches
          while (remainingQuantity > 0) {
            // Use the helper method to open a new child batch from the parent's stock
            const newChildBatch = await this.openChildBatchFromParent(
              product,
              queryRunner,
            );

            // Allocate from the newly created child batch
            const available = newChildBatch.currentStock;
            const qtyToUse = Math.min(remainingQuantity, available);
            remainingQuantity -= qtyToUse;
            itemCost += newChildBatch.costInclTax * qtyToUse;
            const sellingPrice = item.sellingPrice || product.sellingPrice;
            itemProfit += (sellingPrice - newChildBatch.costInclTax) * qtyToUse;
          }

          if (remainingQuantity > 0) {
            throw new Error(
              `Not enough set stock available for product ${product.productDetails.name}.`,
            );
          }
        } else {
          for (const batch of productStockBatches) {
            if (remainingQuantity <= 0) break;
            const availableQuantityInBatch = batch.currentStock;
            const quantityToUse = Math.min(
              remainingQuantity,
              availableQuantityInBatch,
            );
            console.log('quantityToUse: ', quantityToUse);
            remainingQuantity -= quantityToUse;
            const costPerUnit = batch.costInclTax;
            itemCost += costPerUnit * quantityToUse;
            const sellingPrice = item.sellingPrice || product.sellingPrice;
            itemProfit += (sellingPrice - costPerUnit) * quantityToUse;
          }
        }
        if (remainingQuantity > 0) {
          throw new Error(
            `Not enough stock for product ${product.productDetails.name}.`,
          );
        }
        item.cost = itemCost;
        item.profit = itemProfit;
        totalCost += itemCost;
        totalProfit += itemProfit;
      }
      const order = await this.orderRepository.create({
        ...createOrderDto,
        shift: { id: createOrderDto.shiftId },
        purchasedItems: orderItems,
        status: OrderStatus.DRAFT,
        totalCost,
        totalProfit,
      });
      const savedOrder = await this.orderRepository.save(order);
      console.log('savedOrder: ', savedOrder);
      await queryRunner.commitTransaction();
      return this.findOneWithRelations(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDraftOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { purchasedItems, ...orderData } = updateOrderDto;
      const existingOrder = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: [
          'purchasedItems',
          'purchasedItems.product',
          'purchasedItems.product.parent',
          'purchasedItems.product.productDetails',
        ],
      });
      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      if (existingOrder.status !== OrderStatus.DRAFT) {
        throw new Error(`Cannot update a non-draft order.`);
      }
      Object.assign(existingOrder, orderData);

      let totalCost = 0;
      let totalProfit = 0;

      if (purchasedItems) {
        // Remove items that are no longer present
        const itemsToRemove = existingOrder.purchasedItems.filter(
          (item) => !purchasedItems.some((newItem) => newItem.id === item.id),
        );
        existingOrder.purchasedItems = existingOrder.purchasedItems.filter(
          (item) =>
            !itemsToRemove.some((removedItem) => removedItem.id === item.id),
        );
        if (itemsToRemove.length > 0) {
          await queryRunner.manager.remove(itemsToRemove);
        }

        const updatedItemPromises = purchasedItems.map(async (item) => {
          // --- Updating an existing item ---
          if (item.id) {
            const existingItem = existingOrder.purchasedItems.find(
              (purchasedItem) => purchasedItem.id === item.id,
            );
            if (existingItem) {
              if (item.productId && !existingItem.product) {
                const product = await this.productsService.findOne(
                  item.productId,
                );
                existingItem.product = product;
              }
              Object.assign(existingItem, item);

              // Recalculate cost and profit
              let itemCost = 0;
              let itemProfit = 0;
              const product = await this.productsService.findOne(
                existingItem.product.id,
              );
              let remainingQuantity = existingItem.quantity;

              if (product.productDetails.type === ProductType.TRANSFORMED) {
                if (
                  !product.productDetails.components ||
                  product.productDetails.components.length === 0
                ) {
                  throw new Error(
                    `Final product ${product.productDetails.name} does not have defined components.`,
                  );
                }
                let totalComponentsCost = 0;
                for (const component of product.productDetails.components) {
                  const productStoreForComponent =
                    await this.productsService.findProductStoreForComponent(
                      component.id,
                      product.store.id,
                    );
                  const compStockBatches =
                    await this.productsService.findProductStockBatchesFifo(
                      productStoreForComponent.id,
                    );
                  let compRemainingQty = existingItem.quantity * component.qty;
                  let compCost = 0;
                  for (const batch of compStockBatches) {
                    if (compRemainingQty <= 0) break;
                    const qtyToUse = Math.min(
                      compRemainingQty,
                      batch.currentStock,
                    );
                    compRemainingQty -= qtyToUse;
                    compCost += batch.costInclTax * qtyToUse;
                  }
                  if (compRemainingQty > 0) {
                    throw new Error(
                      `Not enough stock for component ${productStoreForComponent.productDetails.name}.`,
                    );
                  }
                  totalComponentsCost += compCost;
                }
                itemCost = totalComponentsCost;
                const sellingPrice =
                  existingItem.sellingPrice || product.sellingPrice;
                itemProfit =
                  sellingPrice * existingItem.quantity - totalComponentsCost;
                remainingQuantity = 0;
              }
              // --- End Transformed Handling ---
              else if (product.parent) {
                // Try to get open child batches for the set
                let childBatches =
                  await this.productsService.findProductStockBatchesFifo(
                    product.id,
                  );
                if (!childBatches.length) {
                  const newChildBatch = await this.openChildBatchFromParent(
                    product,
                    queryRunner,
                  );
                  // Use this new batch as the starting point for allocations
                  childBatches = [newChildBatch];
                }

                // Allocate from the available child batches
                for (const batch of childBatches) {
                  if (remainingQuantity <= 0) break;
                  const available = batch.currentStock;
                  const qtyToUse = Math.min(remainingQuantity, available);
                  remainingQuantity -= qtyToUse;
                  itemCost += batch.costInclTax * qtyToUse;
                  const sellingPrice =
                    existingItem.sellingPrice || product.sellingPrice;
                  itemProfit += (sellingPrice - batch.costInclTax) * qtyToUse;
                }

                while (remainingQuantity > 0) {
                  // Use the helper method to open a new child batch from the parent's stock
                  const newChildBatch = await this.openChildBatchFromParent(
                    product,
                    queryRunner,
                  );

                  // Allocate from the newly created child batch
                  const available = newChildBatch.currentStock;
                  const qtyToUse = Math.min(remainingQuantity, available);
                  remainingQuantity -= qtyToUse;
                  itemCost += newChildBatch.costInclTax * qtyToUse;
                  const sellingPrice =
                    item.sellingPrice || product.sellingPrice;
                  itemProfit +=
                    (sellingPrice - newChildBatch.costInclTax) * qtyToUse;
                }

                if (remainingQuantity > 0) {
                  throw new Error(
                    `Not enough set stock available for product ${product.productDetails.name}.`,
                  );
                }
              } else {
                // --- For pack (non-set) products ---
                const productStockBatches =
                  await this.productsService.findProductStockBatchesFifo(
                    product.id,
                  );
                for (const batch of productStockBatches) {
                  if (remainingQuantity <= 0) break;
                  const availableQuantity = batch.currentStock;
                  const quantityToUse = Math.min(
                    remainingQuantity,
                    availableQuantity,
                  );
                  remainingQuantity -= quantityToUse;
                  const costPerUnit = batch.costInclTax;
                  itemCost += costPerUnit * quantityToUse;
                  const sellingPrice =
                    existingItem.sellingPrice || product.sellingPrice;
                  itemProfit += (sellingPrice - costPerUnit) * quantityToUse;
                }
                if (remainingQuantity > 0) {
                  throw new Error(
                    `Not enough stock for product ${product.productDetails.name}.`,
                  );
                }
              }

              existingItem.cost = itemCost;
              existingItem.profit = itemProfit;
              return queryRunner.manager.save(existingItem);
            }
          } else {
            // --- Creating a new order item ---
            const newItem = queryRunner.manager.create(OrderItem, item);
            if (item.productId) {
              const product = await this.productsService.findOne(
                item.productId,
              );
              newItem.product = product;
            }
            let itemCost = 0;
            let itemProfit = 0;
            const product =
              newItem.product ||
              (await this.productsService.findOne(newItem.product.id));
            let remainingQuantity = newItem.quantity;

            // --- New Transformed Product Handling ---
            if (product.productDetails.type === ProductType.TRANSFORMED) {
              if (
                !product.productDetails.components ||
                product.productDetails.components.length === 0
              ) {
                throw new Error(
                  `Final product ${product.productDetails.name} does not have defined components.`,
                );
              }
              let totalComponentsCost = 0;
              for (const component of product.productDetails.components) {
                const productStoreForComponent =
                  await this.productsService.findProductStoreForComponent(
                    component.id,
                    product.store.id,
                  );
                const compStockBatches =
                  await this.productsService.findProductStockBatchesFifo(
                    productStoreForComponent.id,
                  );
                let compRemainingQty = newItem.quantity * component.qty;
                let compCost = 0;
                for (const batch of compStockBatches) {
                  if (compRemainingQty <= 0) break;
                  const qtyToUse = Math.min(
                    compRemainingQty,
                    batch.currentStock,
                  );
                  compRemainingQty -= qtyToUse;
                  compCost += batch.costInclTax * qtyToUse;
                }
                if (compRemainingQty > 0) {
                  throw new Error(
                    `Not enough stock for component ${productStoreForComponent.productDetails.name}.`,
                  );
                }
                totalComponentsCost += compCost;
              }
              itemCost = totalComponentsCost;
              const sellingPrice = newItem.sellingPrice || product.sellingPrice;
              itemProfit =
                sellingPrice * newItem.quantity - totalComponentsCost;
              remainingQuantity = 0;
            }
            // --- End Transformed Handling ---
            else if (product.parent) {
              // Handle as a set
              let childBatches =
                await this.productsService.findProductStockBatchesFifo(
                  product.id,
                );
              if (!childBatches.length) {
                const parentBatches =
                  await this.productsService.findProductStockBatchesFifo(
                    product.parent.id,
                  );
                if (!parentBatches.length) {
                  throw new Error(
                    `Not enough stock in parent pack for product ${product.productDetails.name}.`,
                  );
                }
                const parentBatch = parentBatches[0];
                if (parentBatch.currentStock < 1) {
                  throw new Error(
                    `Not enough pack stock available in parent for product ${product.productDetails.name}.`,
                  );
                }
                const piecesPerPack =
                  product.parent.productDetails.piecesPerPack;
                const costPerSet = parentBatch.costInclTax / piecesPerPack;
                const simulatedChildBatch = {
                  currentStock: piecesPerPack,
                  costInclTax: costPerSet,
                } as ProductStockBatch;
                childBatches = [simulatedChildBatch];
              }
              for (const batch of childBatches) {
                if (remainingQuantity <= 0) break;
                const available = batch.currentStock;
                const qtyToUse = Math.min(remainingQuantity, available);
                remainingQuantity -= qtyToUse;
                itemCost += batch.costInclTax * qtyToUse;
                const sellingPrice =
                  newItem.sellingPrice || product.sellingPrice;
                itemProfit += (sellingPrice - batch.costInclTax) * qtyToUse;
              }
              if (remainingQuantity > 0) {
                throw new Error(
                  `Not enough set stock available for product ${product.productDetails.name}.`,
                );
              }
            } else {
              // Handle as a pack
              const productStockBatches =
                await this.productsService.findProductStockBatchesFifo(
                  product.id,
                );
              for (const batch of productStockBatches) {
                if (remainingQuantity <= 0) break;
                const availableQuantity = batch.currentStock;
                const quantityToUse = Math.min(
                  remainingQuantity,
                  availableQuantity,
                );
                remainingQuantity -= quantityToUse;
                const costPerUnit = batch.costInclTax;
                itemCost += costPerUnit * quantityToUse;
                const sellingPrice =
                  newItem.sellingPrice || product.sellingPrice;
                itemProfit += (sellingPrice - costPerUnit) * quantityToUse;
              }
              if (remainingQuantity > 0) {
                throw new Error(
                  `Not enough stock for product ${product.productDetails.name}.`,
                );
              }
            }
            newItem.cost = itemCost;
            newItem.profit = itemProfit;
            existingOrder.purchasedItems.push(newItem);
            return queryRunner.manager.save(newItem);
          }
        });
        await Promise.all(updatedItemPromises);
      }

      totalCost = existingOrder.purchasedItems.reduce(
        (acc, item) => acc + (item.cost || 0),
        0,
      );
      totalProfit = existingOrder.purchasedItems.reduce(
        (acc, item) => acc + (item.profit || 0),
        0,
      );
      existingOrder.totalCost = totalCost;
      existingOrder.totalProfit = totalProfit;
      const savedOrder = await queryRunner.manager.save(existingOrder);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeOrder(id: string, queryRunner?: QueryRunner): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['purchasedItems', 'purchasedItems.product', 'shift'],
    });
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    const runner =
      queryRunner ||
      (await this.orderRepository.manager.connection.createQueryRunner());
    if (!queryRunner) {
      await runner.connect();
      await runner.startTransaction();
    }
    try {
      let totalCost = 0;
      let totalProfit = 0;
      for (const item of order.purchasedItems) {
        const product = await this.productsService.findOne(item.product.id);
        console.log('product: ', product);
        const isSet = !!product.parent;
        let remainingQuantity = item.quantity;
        let itemCost = 0;
        let itemProfit = 0;
        // --- NEW: Transformed Product Allocation ---
        if (product.productDetails.type === ProductType.TRANSFORMED) {
          if (
            !product.productDetails.components ||
            product.productDetails.components.length === 0
          ) {
            throw new Error(
              `Final product ${product.productDetails.name} does not have defined components.`,
            );
          }
          let totalComponentsCost = 0;
          for (const component of product.productDetails.components) {
            const productStoreForComponent =
              await this.productsService.findProductStoreForComponent(
                component.id,
                product.store.id,
              );
            const compStockBatches =
              await this.productsService.findProductStockBatchesFifo(
                productStoreForComponent.id,
              );
            let compRemainingQty = item.quantity * component.qty;
            let compCost = 0;
            for (const batch of compStockBatches) {
              if (compRemainingQty <= 0) break;
              const available = batch.currentStock;
              const qtyToUse = Math.min(compRemainingQty, available);
              compRemainingQty -= qtyToUse;
              compCost += batch.costInclTax * qtyToUse;
              // Decrement component batch's stock and update
              batch.currentStock -= qtyToUse;
              await this.productsStockBatchService.simpleUpdateStockBatch(
                batch,
                runner,
              );
            }
            if (compRemainingQty > 0) {
              throw new Error(
                `Not enough stock for component ${productStoreForComponent.productDetails.name}.`,
              );
            }
            totalComponentsCost += compCost;
          }
          const sellingPrice = item.sellingPrice || product.sellingPrice;
          itemCost = totalComponentsCost;
          itemProfit = sellingPrice * item.quantity - totalComponentsCost;
          remainingQuantity = 0;
        }
        // --- END NEW Transformed Product Allocation ---
        else if (isSet) {
          // --- SETS ALLOCATION ---
          // Try to get existing open child batches (FIFO)
          let childBatches =
            await this.productsService.findProductStockBatchesFifo(product.id);

          // If no open child batch exists, "open" a new pack from the parent:
          if (!childBatches.length) {
            // Get parent's (pack) stock batches using FIFO
            const parentBatches =
              await this.productsService.findProductStockBatchesFifo(
                product.parent.id,
              );
            if (!parentBatches.length) {
              throw new Error(
                `Not enough stock in parent pack for product ${product.productDetails.name}.`,
              );
            }
            const parentBatch = parentBatches[0];
            if (parentBatch.currentStock < 1) {
              throw new Error(
                `Not enough pack stock available in parent for product ${product.productDetails.name}.`,
              );
            }
            // Decrement parent's stock by 1 pack
            parentBatch.currentStock -= 1;
            await this.productsStockBatchService.simpleUpdateStockBatch(
              parentBatch,
              runner,
            );

            // Create a new child batch representing the opened pack
            const piecesPerPack = product.parent.productDetails.piecesPerPack;
            const costPerSet = parentBatch.costInclTax / piecesPerPack;
            const newChildBatch = await this.productsStockBatchService.create(
              {
                productStoreId: product.id,
                originalStock: piecesPerPack,
                currentStock: piecesPerPack,
                costExclTax: costPerSet, // adjust as needed (and tax calculation)
                tax: parentBatch.tax / piecesPerPack,
                costInclTax: costPerSet,
                purchaseDate: parentBatch.purchaseDate,
                supplierId: parentBatch.supplier.id || null,
                origin: StockBatchOrigin.PURCHASE,
                originId: parentBatch.originId,
              },
              runner,
            );
            // Use the newly created child batch as our starting point
            childBatches = [newChildBatch];
          }

          // Allocate quantity from the available child batches
          for (const batch of childBatches) {
            if (remainingQuantity <= 0) break;
            const available = batch.currentStock;
            const qtyToUse = Math.min(remainingQuantity, available);
            remainingQuantity -= qtyToUse;
            itemCost += batch.costInclTax * qtyToUse;
            const sellingPrice = item.sellingPrice || product.sellingPrice;
            itemProfit += (sellingPrice - batch.costInclTax) * qtyToUse;

            // Decrement the child batch's stock and update
            batch.currentStock -= qtyToUse;
            await this.productsStockBatchService.simpleUpdateStockBatch(
              batch,
              runner,
            );
          }
          if (remainingQuantity > 0) {
            throw new Error(
              `Not enough set stock available for product ${product.productDetails.name}.`,
            );
          }
        } else {
          // --- PACKS (Non-set) ALLOCATION ---
          const productStockBatches =
            await this.productsService.findProductStockBatchesFifo(product.id);
          for (const batch of productStockBatches) {
            if (remainingQuantity <= 0) break;
            const availableQuantityInBatch = batch.currentStock;
            const quantityToUse = Math.min(
              remainingQuantity,
              availableQuantityInBatch,
            );
            remainingQuantity -= quantityToUse;
            const costPerUnit = batch.costInclTax;
            itemCost += costPerUnit * quantityToUse;
            const sellingPrice = item.sellingPrice || product.sellingPrice;
            itemProfit += (sellingPrice - costPerUnit) * quantityToUse;
            console.log('batch: ', batch);
            console.log('quantityToUse: ', quantityToUse);
            batch.currentStock = batch.currentStock - quantityToUse;
            const savedBatch = await runner.manager.save(batch);
            console.log('savedBatch: ', savedBatch);
          }
          if (remainingQuantity > 0) {
            throw new Error(
              `Not enough stock for product ${product.productDetails.name}.`,
            );
          }
        }

        item.cost = itemCost;
        item.profit = itemProfit;
        item.status = OrderItemStatus.SOLD;
        await runner.manager.update(ProductStore, product.id, {
          salesCount: product.salesCount + item.quantity,
        });
        totalCost += itemCost;
        totalProfit += itemProfit;
        await runner.manager.save(item);
      }
      await runner.manager.update(Order, id, {
        totalCost,
        totalProfit,
        status: OrderStatus.COMPLETED,
      });
      await this.shiftsService.updateAfterOrderComplete(order, runner);
      if (!queryRunner) {
        await runner.commitTransaction();
      }
    } catch (error) {
      console.error('Error completing order:', error);
      if (!queryRunner) {
        await runner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner) {
        await runner.release();
      }
    }
  }

  // fix this with the new item order cost and profit
  async refundOrderItems(
    orderId: string,
    refundItems: RefundItemDto[],
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['purchasedItems', 'purchasedItems.product', 'shift'],
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found.`);
      }
      for (const { id, quantity } of refundItems) {
        const orderItem = order.purchasedItems.find((item) => item.id === id);
        if (!orderItem) {
          throw new NotFoundException(`Order item with ID ${id} not found.`);
        }
        if (quantity > orderItem.quantity) {
          throw new Error(
            `Refund quantity exceeds the quantity of order item ${id}.`,
          );
        }
        if (quantity === orderItem.quantity) {
          orderItem.status = OrderItemStatus.REFUNDED;
          await queryRunner.manager.save(orderItem);
        } else {
          console.log('orderItem: ', orderItem);
          const costPerUnit = orderItem.cost / orderItem.quantity;
          const profitPerUnit = orderItem.profit / orderItem.quantity;
          orderItem.quantity -= quantity;
          orderItem.total = orderItem.quantity * orderItem.sellingPrice;
          orderItem.cost = orderItem.quantity * costPerUnit;
          orderItem.profit = orderItem.quantity * profitPerUnit;
          const savedOrderItem = await queryRunner.manager.save(orderItem);
          console.log('savedOrderItem: ', savedOrderItem);

          const refundedTotal = quantity * orderItem.sellingPrice;
          const refundedCost = quantity * costPerUnit;
          const refundedProfit = quantity * profitPerUnit;

          const refundedItem = this.orderItemRepository.create({
            ...orderItem, // Consider omitting properties that are recalculated
            quantity,
            total: refundedTotal,
            cost: refundedCost,
            profit: refundedProfit,
            status: OrderItemStatus.REFUNDED,
            order: { id: orderId },
          });
          console.log('refundedItem: ', refundedItem);
          delete refundedItem.id;
          const savedRefundedItem =
            await queryRunner.manager.save(refundedItem);
          console.log('savedRefundedItem: ', savedRefundedItem);

          order.purchasedItems.push(savedRefundedItem);
        }
        const product = await this.productsService.findOne(
          orderItem.product.id,
        );
        let remainingQuantity = quantity;
        const fifoBatches =
          await this.productsService.findProductStockBatchesFifo(
            orderItem.product.id,
          );
        // Add refunded quantity to batches with stock > 0 (FIFO)
        for (const batch of fifoBatches) {
          if (remainingQuantity <= 0) break;
          const availableStockInBatch =
            batch.originalStock - batch.currentStock;
          const quantityToAdd = Math.min(
            remainingQuantity,
            availableStockInBatch,
          );
          batch.currentStock += quantityToAdd;
          remainingQuantity -= quantityToAdd;
          await queryRunner.manager.save(batch);
        }
        // If there is remaining quantity to refund, use batches with current stock = 0 (LIFO logic)
        if (remainingQuantity > 0) {
          const lifoBatches =
            await this.productsService.findProductStockBatchesLifo(
              orderItem.product.id,
            );
          for (const batch of lifoBatches) {
            if (remainingQuantity <= 0) break;
            const availableStockInBatch =
              batch.originalStock - batch.currentStock;
            const quantityToAdd = Math.min(
              remainingQuantity,
              availableStockInBatch,
            );
            batch.currentStock += quantityToAdd;
            remainingQuantity -= quantityToAdd;
            await queryRunner.manager.save(batch);
          }
        }
        // If there's still remaining quantity after all batches are filled, throw an error
        if (remainingQuantity > 0) {
          throw new Error(
            `Not enough stock to handle refund for product ${product.productDetails.name}`,
          );
        }
      }

      // --- Update overall order totals ---
      // Option 1: Recalculate based on order.purchasedItems
      const activeItems = order.purchasedItems.filter(
        (item) => item.status !== OrderItemStatus.REFUNDED,
      );
      const refundedItems = order.purchasedItems.filter(
        (item) => item.status === OrderItemStatus.REFUNDED,
      );

      order.totalItems = activeItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      order.totalAmount = activeItems.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      order.totalRefund = refundedItems.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      order.totalCost = activeItems.reduce(
        (sum, item) => sum + (item.cost || 0),
        0,
      );
      order.totalProfit = activeItems.reduce(
        (sum, item) => sum + (item.profit || 0),
        0,
      );
      if (
        order.purchasedItems.every(
          (item) => item.status === OrderItemStatus.REFUNDED,
        )
      ) {
        order.status = OrderStatus.REFUNDED;
      }
      const savedOrder = await queryRunner.manager.save(order);
      console.log('savedOrder', savedOrder);
      await this.shiftsService.updateShiftTotals(
        savedOrder.shift.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return this.findOneWithRelations(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(id: string, queryRunner?: QueryRunner) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['purchasedItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    order.status = OrderStatus.CANCELED;
    for (const item of order.purchasedItems) {
      item.status = OrderItemStatus.CANCELED;
      await queryRunner.manager.save(item);
    }
    return queryRunner
      ? queryRunner.manager.save(order)
      : this.orderRepository.save(order);
  }

  findAllOrders(userRole: Role): Promise<Order[]> {
    const whereClause =
      userRole === Role.CASHIER ? { status: Not(OrderStatus.CANCELED) } : {};
    return this.orderRepository.find({
      where: whereClause,
      relations: [
        'purchasedItems',
        'purchasedItems.product',
        'customer',
        'shift',
        'shift.store',
        'shift.user',
      ],
      order: {
        dateTime: 'DESC',
      },
    });
  }

  findAllPurchasedItems() {
    return this.orderItemRepository.find({ relations: ['order', 'product'] });
  }

  findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
    });
  }

  findOneWithRelations(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: [
        'purchasedItems',
        'purchasedItems.product',
        'customer',
        'payments',
        'shift',
        'shift.store',
        'shift.user',
      ],
    });
  }

  async findByDate(date: string, userRole: Role): Promise<Order[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: any = {
      dateTime: Between(startOfDay, endOfDay),
    };

    if (userRole === Role.CASHIER) {
      whereClause.status = Not(OrderStatus.CANCELED);
    }

    return this.orderRepository.find({
      where: whereClause,
      relations: [
        'purchasedItems',
        'purchasedItems.product',
        'customer',
        'payments',
        'shift',
        'shift.store',
        'shift.user',
      ],
      order: {
        dateTime: 'DESC',
      },
    });
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['purchasedItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    await this.orderItemRepository.delete(
      order.purchasedItems.map((item) => item.id),
    );
    return this.orderRepository.delete(id);
  }
}
