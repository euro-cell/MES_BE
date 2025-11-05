import { Controller } from '@nestjs/common';
import { ProductMaterialService } from './material.service';

@Controller(':projectId/material')
export class ProductMaterialController {
  constructor(private readonly productMaterialService: ProductMaterialService) {}
}
