import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from "class-validator";
import { InventoryStatus } from "../enums/inventory-status.enum";
import { InventoryLineDto } from "./inventory-line.dto";

export class InventoryDto {
    @IsOptional()
    @IsUUID()
    id: string;

    @IsEnum(InventoryStatus)
    status: InventoryStatus;

    @IsNotEmpty()
    @IsUUID()
    storeId: string;
    
    @IsNumber()
    expectedValue: number;

    @IsNumber()
    foundValue: number;

    @IsNumber()
    lossValue: number;

    @IsArray()
    inventoryLines: InventoryLineDto[]; 
}
