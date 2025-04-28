import { PartialType } from "@nestjs/mapped-types";
import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class UpdatePurchaseItemDto extends PartialType(CreatePurchaseItemDto) {}
