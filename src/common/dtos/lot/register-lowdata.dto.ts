import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterLowDataDto {
  @ApiProperty({
    description: '헤더 목록 (예: ["lot", "Pre-Formation PFC", ...])',
    example: ['lot', 'Pre-Formation PFC', 'Pre-Formation RFD'],
  })
  @IsArray()
  @IsString({ each: true })
  headers: string[];

  @ApiProperty({
    description: 'Low Data 배열',
    example: [
      { lot: 'O1CD010001', 'Pre-Formation PFC': '0.123', 'Pre-Formation RFD': '0.456' },
      { lot: 'O1CD010002', 'Pre-Formation PFC': '0.234', 'Pre-Formation RFD': '0.567' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  data: Record<string, string>[];
}
