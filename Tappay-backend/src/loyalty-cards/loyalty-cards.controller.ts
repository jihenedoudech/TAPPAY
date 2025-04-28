import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LoyaltyCardsService } from './loyalty-cards.service';
import { CreateLoyaltyCardDto } from './dto/create-loyalty-card.dto';
import { UpdateLoyaltyCardDto } from './dto/update-loyalty-card.dto';

@Controller('loyalty-cards')
export class LoyaltyCardsController {
  constructor(private readonly loyaltyCardsService: LoyaltyCardsService) {}

  @Post()
  create(@Body() createLoyaltyCardDto: CreateLoyaltyCardDto) {
    return this.loyaltyCardsService.create(createLoyaltyCardDto);
  }

  @Get()
  findAll() {
    return this.loyaltyCardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loyaltyCardsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLoyaltyCardDto: UpdateLoyaltyCardDto,
  ) {
    return this.loyaltyCardsService.update(id, updateLoyaltyCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loyaltyCardsService.remove(id);
  }
}
