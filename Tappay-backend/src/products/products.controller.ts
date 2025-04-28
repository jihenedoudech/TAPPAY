// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  Patch,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Role } from '../auth/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { editFileName } from '../common/functions/editFileName';
import { diskStorage } from 'multer';
import { ProductsStockBatchService } from './products-stock-batch.service';
import { ProductDetailsDto } from './dto/product-details.dto';
import { ProductStoreDto } from './dto/product-store.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsStockBatchService: ProductsStockBatchService,
  ) {}

  @Post('save-product-details')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads/products',
        filename: editFileName,
      }),
    }),
  )
  async save(
    @Body('product') product: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    console.log('product: ', product);
    const productDetailsDto: ProductDetailsDto = JSON.parse(product);

    if (image) {
      productDetailsDto.image = image.filename;
    }
    console.log('productDetailsDto: ', productDetailsDto);
    return this.productsService.saveProductDetails(productDetailsDto);
  }

  @Post('save-product-store')
  @Roles(Role.ADMIN, Role.MANAGER)
  async saveProductStore(@Body() productStoreDto: ProductStoreDto) {
    return this.productsService.saveProductStore(productStoreDto);
  }

  @Get('products-details')
  async findAll(@Request() req) {
    return this.productsService.findAllDetails();
  }

  @Get('products-in-store')
  async findAllInStore(@Request() req, @Query('storeId') storeId: string) {
    const userRole = req.user.role;
    if (userRole === Role.ADMIN || userRole === Role.MANAGER) {
      return this.productsService.findAllInStore(storeId);
    } else {
      return this.productsService.findAllLimitedInStore(storeId);
    }
  }

  @Get('products-across-stores')
  async findAllAcrossStores(@Request() req) {
    const userId = req.user.id;
    return this.productsService.findAllAcrossStores(userId);
  }

  @Get('stock-batches')
  async findAllStockBatches() {
    return this.productsStockBatchService.findAll();
  }

  @Get('test')
  async test(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  async findOne(@Param('id') id: string, @Body() body: any) {
    const userRole = body.userRole;
    if (userRole === Role.ADMIN || userRole === Role.MANAGER) {
      return this.productsService.findOneNotRemoved(id);
    } else {
      return this.productsService.findOneLimited(id);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
