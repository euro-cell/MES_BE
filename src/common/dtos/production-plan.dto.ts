import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

class ProcessDateRange {
  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;
}

export class CreateProductionPlanDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  weekInfo: string;

  @IsObject()
  processPlans: Record<string, ProcessDateRange>;
}

export class UpdateProductionPlanDto extends PartialType(CreateProductionPlanDto) {}
