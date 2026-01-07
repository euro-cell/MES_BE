import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CellInventoryService } from './cell-inventory.service';

@ApiTags('Cell Inventory')
@Controller('cell-inventory')
export class CellInventoryController {
  constructor(private readonly cellInventoryService: CellInventoryService) {}
}
