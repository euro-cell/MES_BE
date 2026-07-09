import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

class ProjectDto {
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

  @ApiProperty({ required: false, nullable: true, description: '고객사 ID' })
  customerId?: number | null;
}

export class CreateProjectDto extends OmitType(ProjectDto, ['id'] as const) {}

export class UpdateProjectDto extends PartialType(OmitType(ProjectDto, ['id'] as const)) {}
