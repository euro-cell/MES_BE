import { ApiProperty, OmitType } from '@nestjs/swagger';

class ProductionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  mode: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  month: number;

  @ApiProperty()
  round: number;

  @ApiProperty()
  batteryType: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  targetQuantity: number;
}

export class CreateProductionDto extends OmitType(ProductionDto, ['id'] as const) {}
