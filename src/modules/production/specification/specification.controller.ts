import { Controller } from '@nestjs/common';
import { ProductSpecificationService } from './specification.service';

@Controller(':projectId/specification')
export class ProductSpecificationController {
  constructor(private readonly productSpecificationService: ProductSpecificationService) {}
}
