import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateLoyaltyCardDto {
  @IsBoolean()
  haveLoyaltyCard: boolean;

  @IsOptional()
  @IsString()
  reference: string;
}
