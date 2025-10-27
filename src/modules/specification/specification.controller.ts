import { Body, Controller, Post } from '@nestjs/common';
import { SpecificationService } from './specification.service';
import { CreateBatteryDesignDto } from 'src/common/dtos/specification.dto';

@Controller('specification')
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  @Post()
  async createSpecification(@Body() dto: CreateBatteryDesignDto) {
    return this.specificationService.createSpecification(dto);
  }
}
