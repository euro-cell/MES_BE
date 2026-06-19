import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Matches } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateStackingWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 =====

  // 분리막
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorManufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  separatorSpec?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorInputQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorUsage?: number;

  // 양극 매거진 LOT 1~3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cathodeMagazineLot3?: string;

  // 음극 매거진 LOT 1~3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anodeMagazineLot3?: string;

  // ===== B. 생산 정보 =====

  // 스택 생산
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionWorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionGoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackProductionDefectRate?: number;

  // HiPot1
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1WorkQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1GoodQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DefectQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DiscardQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1DefectRate?: number;

  // JR Number 1
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber1SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber1WorkTime?: string;

  // JR Number 2
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber2SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber2WorkTime?: string;

  // JR Number 3
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber3SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber3WorkTime?: string;

  // JR Number 4
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber4SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber4WorkTime?: string;

  // JR Number 5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber5?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber5Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber5CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber5AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber5SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber5WorkTime?: string;

  // JR Number 6
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber6?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber6Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber6CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber6AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber6SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber6WorkTime?: string;

  // JR Number 7
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber7?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber7Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber7CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber7AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber7SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber7WorkTime?: string;

  // JR Number 8
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber8?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber8Range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber8CathodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber8AnodeLot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jrNumber8SeparatorLot?: string;

  @ApiPropertyOptional({ example: '09:30~12:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}~\d{2}:\d{2}$/, { message: '시간 형식은 HH:mm~HH:mm 이어야 합니다.' })
  jrNumber8WorkTime?: string;

  // 전극 파손 수량 (통합)
  @ApiPropertyOptional({ description: '양극(+) 파손 수량' })
  @IsOptional()
  @IsNumber()
  cathodeDefect?: number;

  @ApiPropertyOptional({ description: '음극(-) 파손 수량' })
  @IsOptional()
  @IsNumber()
  anodeDefect?: number;

  // ===== C. 공정 조건 =====

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jellyRollWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jellyRollThickness?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  separatorLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stackCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hipot1Voltage?: number;

  @ApiPropertyOptional({ description: '양극(+) 두께 측정값 (㎛)' })
  @IsOptional()
  @IsNumber()
  cathodeThickness?: number;

  @ApiPropertyOptional({ description: '음극(-) 두께 측정값 (㎛)' })
  @IsOptional()
  @IsNumber()
  anodeThickness?: number;
}

export class UpdateStackingWorklogDto extends PartialType(CreateStackingWorklogDto) {}

export class StackingWorklogListResponseDto extends BaseWorklogListResponseDto {}
