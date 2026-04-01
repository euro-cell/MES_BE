import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OqcProcessType, OqcItemType } from '../../enums/oqc.enum';
import type { OqcSpecs } from '../../entities/specification/oqc-spec.entity';

export class SaveOqcSpecDto {
  @ApiProperty({ enum: OqcProcessType, example: 'GRADING' })
  @IsEnum(OqcProcessType)
  @IsNotEmpty()
  processType: OqcProcessType;

  @ApiProperty({ enum: OqcItemType, example: 'GRADING' })
  @IsEnum(OqcItemType)
  @IsNotEmpty()
  itemType: OqcItemType;

  @ApiProperty({
    example: {
      capacity: { min: 37.8, unit: 'Ah' },
      acIr: { max: 1.0, unit: 'mΩ' },
      ocv3: { min: 2.19, unit: 'V' },
      deltaV: { max: 3, unit: 'mV' },
    },
  })
  @IsObject()
  @IsNotEmpty()
  specs: OqcSpecs;
}
