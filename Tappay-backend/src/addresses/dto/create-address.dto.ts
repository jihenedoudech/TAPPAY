import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    street: string;

    @IsOptional()
    @IsString()
    zip: string;
}
