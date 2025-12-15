import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ProductionTargetDto {
  // 전극 공정
  @ApiPropertyOptional({ description: '믹싱 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  mixingCathode: number;

  @ApiPropertyOptional({ description: '믹싱 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  mixingAnode: number;

  @ApiPropertyOptional({ description: '코팅 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  coatingCathode: number;

  @ApiPropertyOptional({ description: '코팅 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  coatingAnode: number;

  @ApiPropertyOptional({ description: '프레스 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  pressCathode: number;

  @ApiPropertyOptional({ description: '프레스 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  pressAnode: number;

  @ApiPropertyOptional({ description: '슬리팅 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  slittingCathode: number;

  @ApiPropertyOptional({ description: '슬리팅 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  slittingAnode: number;

  @ApiPropertyOptional({ description: '노칭 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  notchingCathode: number;

  @ApiPropertyOptional({ description: '노칭 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  notchingAnode: number;

  // 조립 공정
  @ApiPropertyOptional({ description: 'VD 공정 - 양극', example: 1000 })
  @IsOptional()
  @IsNumber()
  vdCathode: number;

  @ApiPropertyOptional({ description: 'VD 공정 - 음극', example: 1000 })
  @IsOptional()
  @IsNumber()
  vdAnode: number;

  @ApiPropertyOptional({ description: 'forming 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  forming: number;

  @ApiPropertyOptional({ description: 'stack 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  stack: number;

  @ApiPropertyOptional({ description: 'P/W 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  preWelding: number;

  @ApiPropertyOptional({ description: 'M/W 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  mainWelding: number;

  @ApiPropertyOptional({ description: 'sealing 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  sealing: number;

  @ApiPropertyOptional({ description: 'filling 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  filling: number;

  // 화성 공정
  @ApiPropertyOptional({ description: 'P/F 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  preFormation: number;

  @ApiPropertyOptional({ description: 'degas 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  degas: number;

  @ApiPropertyOptional({ description: 'M/F 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  mainFormation: number;

  @ApiPropertyOptional({ description: 'aging 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  aging: number;

  @ApiPropertyOptional({ description: 'grading 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  grading: number;

  @ApiPropertyOptional({ description: '외관검사 공정', example: 1000 })
  @IsOptional()
  @IsNumber()
  visualInspection: number;
}
