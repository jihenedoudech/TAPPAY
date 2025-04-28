import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsObject, IsArray, ValidateNested } from "class-validator";
import { CreateAddressDto } from "../../addresses/dto/create-address.dto";

export class CreateStoreDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateAddressDto)
    address: CreateAddressDto;

    @IsOptional()
    @IsString()
    phoneNumber: string;

    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    taxIdentificationNumber: string;

    // @IsOptional()
    // @IsObject()
    // operatingHours: Record<string, string>;

    @IsOptional()
    @IsString()
    currency: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    paymentMethods: string[];

    @IsOptional()
    @IsString()
    warehouseLocation: string;
}
