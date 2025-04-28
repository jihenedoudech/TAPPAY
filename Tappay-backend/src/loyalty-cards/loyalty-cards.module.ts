import { Module } from '@nestjs/common';
import { LoyaltyCardsService } from './loyalty-cards.service';
import { LoyaltyCardsController } from './loyalty-cards.controller';
import { LoyaltyCard } from './entities/loyalty-card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyCard])],
  controllers: [LoyaltyCardsController],
  providers: [LoyaltyCardsService],
  exports: [LoyaltyCardsService],
})
export class LoyaltyCardsModule {}
