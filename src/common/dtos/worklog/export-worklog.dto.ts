import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class ExportWorklogRequestDto {
  @ApiProperty({ description: '프로젝트 ID', example: 1 })
  @IsNumber()
  projectId: number;

  @ApiProperty({ description: '작업일지 ID 배열', example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  worklogIds: number[];
}
