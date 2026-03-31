import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateManualDto {
  @ApiProperty({ description: '설비 ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  equipmentId: number;
}

export class UploadManualDto extends CreateManualDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '매뉴얼 파일 (PDF 등)' })
  file: any;
}
