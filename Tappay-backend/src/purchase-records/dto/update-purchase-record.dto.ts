import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseRecordDto } from './create-purchase-record.dto';

export class UpdatePurchaseRecordDto extends PartialType(CreatePurchaseRecordDto) {}
