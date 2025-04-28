import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}
  create(createSupplierDto: CreateSupplierDto) {
    return this.supplierRepository.save(createSupplierDto);
  }

  findAll() {
    return this.supplierRepository.find();
  }

  findOneWithoutRelations(id: string) {
    return this.supplierRepository.findOne({ where: { id } });
  }

  findOneWithRelations(id: string) {
    return this.supplierRepository.findOne({
      where: { id },
      relations: ['purchaseRecords'],
    });
  }

  update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.supplierRepository.update(id, updateSupplierDto);
  }

  remove(id: string) {
    return this.supplierRepository.delete(id);
  }
}
