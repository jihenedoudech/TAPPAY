import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryDto } from './dto/inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductStore } from '../products/entities/product-store.entity';
import { InventoryLine } from './entities/inventory-line.entity';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryLine)
    private inventoryLineRepository: Repository<InventoryLine>,
    @InjectRepository(ProductStore)
    private productStoreRepository: Repository<ProductStore>,
    private storesService: StoresService,
  ) {}

  async save(inventoryDto: InventoryDto): Promise<Inventory> {
    console.log(inventoryDto);
    const { storeId, inventoryLines, ...rest } = inventoryDto;
    let inventory: Inventory;
    const store = await this.storesService.findOne(storeId);
    console.log('store', store);

    // Save the inventory
    inventory = await this.inventoryRepository.save({ ...rest, store });
    console.log('inventory', inventory);

    // Retrieve existing inventory lines from the database
    const existingInventoryLines = await this.inventoryLineRepository.find({
      where: { inventory: { id: inventory.id } },
    });

    // Create a map of existing inventory line IDs for quick lookup
    const existingInventoryLineIds = new Set(
      existingInventoryLines.map((line) => line.id),
    );

    // Create a set of inventory line IDs from the DTO
    const dtoInventoryLineIds = new Set(
      inventoryLines.filter((line) => line.id).map((line) => line.id),
    );

    // Find inventory lines to delete
    const linesToDelete = existingInventoryLines.filter(
      (line) => !dtoInventoryLineIds.has(line.id),
    );

    // Delete inventory lines that are not in the DTO
    for (const line of linesToDelete) {
      await this.inventoryLineRepository.remove(line);
      console.log('Deleted inventory line', line);
    }

    // Save new or updated inventory lines
    for (const inventoryLine of inventoryLines) {
      const productStore = await this.productStoreRepository.findOne({
        where: { id: inventoryLine.productStoreId },
      });
      if (!productStore) {
        throw new NotFoundException(
          `ProductStore with ID ${inventoryLine.productStoreId} not found`,
        );
      }
      console.log('productStore', productStore);
      const inventoryLineSaved = await this.inventoryLineRepository.save({
        ...inventoryLine,
        productStore,
        inventory,
      });
      console.log('inventoryLineSaved', inventoryLineSaved);
    }
    return inventory;
  }

  findAll() {
    return this.inventoryRepository.find({
      relations: [
        'store',
        'inventoryLines',
        'inventoryLines.productStore',
        'inventoryLines.productStore.productDetails',
        'inventoryLines.productStore.stockBatches',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOne(id: string) {
    return this.inventoryRepository.findOne({
      where: { id },
      relations: [
        'store',
        'inventoryLines',
        'inventoryLines.productStore',
        'inventoryLines.productStore.productDetails',
        'inventoryLines.productStore.stockBatches',
      ],
    });
  }

  update(id: string, inventoryDto: InventoryDto) {
    return this.inventoryRepository.update(id, inventoryDto);
  }

  remove(id: string) {
    return this.inventoryRepository.delete(id);
  }
}
