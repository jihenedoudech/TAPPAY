import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryDto } from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  save(@Body() inventoryDto: InventoryDto) {
    console.log('inventoryDto: ', inventoryDto);
    return this.inventoryService.save(inventoryDto);
    // return 'ok';
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('id: ', id);
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() inventoryDto: InventoryDto) {
    return this.inventoryService.update(id, inventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
