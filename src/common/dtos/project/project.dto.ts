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
}

export class CreateProjectDto extends OmitType(ProjectDto, ['id'] as const) {}

export class UpdateProjectDto extends PartialType(OmitType(ProjectDto, ['id'] as const)) {}
