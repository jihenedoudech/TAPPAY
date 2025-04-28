import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from "class-validator";
import { InventoryStatus } from "../enums/inventory-status.enum";

export class InventoryLineDto {
    @IsOptional()
    @IsUUID()
    id: string;

    @IsOptional()
    @IsEnum(InventoryStatus)
    status: InventoryStatus;

    @IsOptional()
    @IsUUID()
    inventoryId: string;

    @IsNotEmpty()
    @IsUUID()
    productStoreId: string;

    @IsOptional()
    @IsNumber()
    expectedQty: number;

    @IsOptional()
    @IsNumber()
    foundQty: number;

    @IsOptional()
    @IsNumber()
    difference: number;

    @IsOptional()
    @IsNumber()
    expectedValue: number;

    @IsOptional()
    @IsNumber()
    foundValue: number;

    @IsOptional()
    @IsNumber()
    lossValue: number;
}

