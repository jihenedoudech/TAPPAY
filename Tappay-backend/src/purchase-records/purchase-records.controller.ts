import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
} from '@nestjs/common';
import { PurchaseRecordsService } from './purchase-records.service';
import { CreatePurchaseRecordDto } from './dto/create-purchase-record.dto';
import { UpdatePurchaseRecordDto } from './dto/update-purchase-record.dto';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { PurchaseItemsService } from './purchase-items.service';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';

@Controller('purchase-records')
export class PurchaseRecordsController {
  constructor(
    private readonly purchaseRecordsService: PurchaseRecordsService,
    private readonly purchaseItemsService: PurchaseItemsService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  create(
    @Body() createPurchaseRecordDto: CreatePurchaseRecordDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is missing from the request.');
    }
    console.log('createPurchaseRecordDto', createPurchaseRecordDto);
    for (const item of createPurchaseRecordDto.purchasedItems) {
      console.log('item.productDetails', item.productDetails);
    }
    return this.purchaseRecordsService.create(createPurchaseRecordDto, userId);
  }

  @Put('update-common-data/:id')
  updateCommonData(
    @Param('id') id: string,
    @Body() updatePurchaseRecordDto: UpdatePurchaseRecordDto,
  ) {
    console.log('id: ', id);
    console.log('updatePurchaseRecordDto', updatePurchaseRecordDto);
    return this.purchaseRecordsService.updateCommonData(
      id,
      updatePurchaseRecordDto,
    );
  }

  @Put('update-item/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updatePurchaseItemDto: UpdatePurchaseItemDto,
  ) {
    console.log('id in controller: ', id);
    console.log('updatePurchaseItemDto in controller:', updatePurchaseItemDto);
    return this.purchaseItemsService.updatePurchaseItem(
      id,
      updatePurchaseItemDto,
    );
  }

  @Get()
  findAll() {
    return this.purchaseRecordsService.findAll();
  }

  @Get('current-quantities/:id')
  findOneWithCurrentQuantities(@Param('id') id: string) {
    return this.purchaseRecordsService.findOneWithCurrentQuantities(id);
  }

  @Get('find-purchase-record-of-item/:id')
  findPurchaseRecordOfItem(@Param('id') id: string) {
    return this.purchaseItemsService.findPurchaseRecordOfItem(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseRecordsService.findOneWithRelations(id);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseRecordDto: UpdatePurchaseRecordDto,
  ) {
    return this.purchaseRecordsService.update(id, updatePurchaseRecordDto);
  }

  @Delete('/items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    console.log('itemId: ', itemId);
    return this.purchaseItemsService.delete(itemId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('recordId: ', id);
    return this.purchaseRecordsService.delete(id);
  }
}
