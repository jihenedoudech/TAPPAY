import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ProductDetails } from '../products/entities/product-details.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private dataSource: DataSource,
    @InjectRepository(ProductDetails)
    private productDetailsRepository: Repository<ProductDetails>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    console.log('createCategoryDto', createCategoryDto);
    const { productsIds, ...categoryData } = createCategoryDto;

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = await queryRunner.manager.save(Category, categoryData);
      if (productsIds && productsIds.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .relation(Category, 'products')
          .of(category.id)
          .add(productsIds);
      }
      await queryRunner.commitTransaction();
      return category;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.categoryRepository.find({
      relations: ['products'],
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { productsIds, ...categoryData } = updateCategoryDto;
    const products = productsIds?.length
      ? await this.productDetailsRepository.find({
          where: { id: In(productsIds) },
        })
      : [];
    const category = await this.categoryRepository.save({
      id,
      ...categoryData,
      products,
    });
    return category;
  }

  remove(id: string) {
    return this.categoryRepository.delete(id);
  }
}
