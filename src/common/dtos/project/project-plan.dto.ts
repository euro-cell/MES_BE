import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

class ProcessDateRange {
  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;
}

export class CreateProjectPlanDto {
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

  @IsInt()
  @IsOptional()
  templateId?: number;
}

export class UpdateProjectPlanDto extends PartialType(CreateProjectPlanDto) {}
