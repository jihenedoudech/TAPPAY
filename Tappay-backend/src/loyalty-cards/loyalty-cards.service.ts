import { Injectable } from '@nestjs/common';
import { CreateLoyaltyCardDto } from './dto/create-loyalty-card.dto';
import { UpdateLoyaltyCardDto } from './dto/update-loyalty-card.dto';
import { LoyaltyCard } from './entities/loyalty-card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LoyaltyCardsService {
  constructor(
    @InjectRepository(LoyaltyCard)
    private loyaltyCardRepository: Repository<LoyaltyCard>,
  ) {}

  create(createLoyaltyCardDto: CreateLoyaltyCardDto) {
    const loyaltyCardEntity = this.loyaltyCardRepository.create(createLoyaltyCardDto);
    return this.loyaltyCardRepository.save(loyaltyCardEntity);
  }
  

  findAll() {
    return this.loyaltyCardRepository.find();
  }

  findOne(id: string) {
    return this.loyaltyCardRepository.findOne({ where: { id } });
  }

  update(id: string, updateLoyaltyCardDto: UpdateLoyaltyCardDto) {
    return this.loyaltyCardRepository.update(id, updateLoyaltyCardDto);
  }

  remove(id: string) {
    return this.loyaltyCardRepository.delete(id);
  }
}
