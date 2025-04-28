import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { LoyaltyCardsService } from '../loyalty-cards/loyalty-cards.service';
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private loyaltyCardService: LoyaltyCardsService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const {loyaltyCard, ...customer} = createCustomerDto;
    if (loyaltyCard.haveLoyaltyCard) {
      const loyaltyCardEntity = await this.loyaltyCardService.create(
        loyaltyCard,
      );
      return this.customerRepository.save({
        ...customer,
        loyaltyCard: loyaltyCardEntity,
      });
    }
    return this.customerRepository.save({
      ...customer,
    });
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      relations: ['orderHistory', 'address', 'loyaltyCard'],
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orderHistory', 'address', 'loyaltyCard'],
    });
    if (!customer)
      throw new NotFoundException(`Customer with id ${id} not found`);
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.preload({
      id,
      ...updateCustomerDto,
    });
    if (!customer)
      throw new NotFoundException(`Customer with id ${id} not found`);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<string> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return id;
  }
}
