import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoaDto {
  @ApiProperty({ description: '자재 ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  materialId: number;

  @ApiProperty({ description: '공정', enum: ['전극', '조립'] })
  @IsIn(['전극', '조립'])
  process: '전극' | '조립';
}

export class UploadCoaDto extends CreateCoaDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'CoA 파일 (PDF 등)' })
  file: any;
}
