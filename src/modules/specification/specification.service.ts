import { Injectable } from '@nestjs/common';
import { CreateBatteryDesignDto } from 'src/common/dtos/specification.dto';

@Injectable()
export class SpecificationService {
  async createSpecification(dto: CreateBatteryDesignDto) {
    console.log('🚀 ~ dto:', dto);
  }
}
