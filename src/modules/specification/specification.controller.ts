import { Controller } from '@nestjs/common';
import { SpecificationService } from './specification.service';

@Controller('specification')
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}
}
