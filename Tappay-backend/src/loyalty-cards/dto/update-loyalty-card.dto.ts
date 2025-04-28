import { PartialType } from '@nestjs/swagger';
import { CreateLoyaltyCardDto } from './create-loyalty-card.dto';

export class UpdateLoyaltyCardDto extends PartialType(CreateLoyaltyCardDto) {}
