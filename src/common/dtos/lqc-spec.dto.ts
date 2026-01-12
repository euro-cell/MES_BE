import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LqcProcessType, LqcItemType } from '../enums/lqc.enum';
import type { LqcSpecs } from '../entities/lqc-spec.entity';

export class CreateLqcSpecDto {
  @ApiProperty({ enum: LqcProcessType, example: 'MIXING_CATHODE' })
  @IsEnum(LqcProcessType)
  @IsNotEmpty()
  processType: LqcProcessType;

  @ApiProperty({ enum: LqcItemType, example: 'BINDER' })
  @IsEnum(LqcItemType)
  @IsNotEmpty()
  itemType: LqcItemType;

  @ApiProperty({
    example: {
      solidContent: { target: 6.0, tolerance: 0.18, unit: '%' },
      viscosity: { target: 1200, tolerance: 3000, unit: 'cps' },
    },
  })
  @IsObject()
  @IsNotEmpty()
  specs: LqcSpecs;
}
