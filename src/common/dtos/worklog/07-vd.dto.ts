import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseWorklogDto, BaseWorklogListResponseDto } from './00-base-worklog.dto';

export class CreateVdWorklogDto extends BaseWorklogDto {
  // ===== A. 자재 투입 정보 (섹션2) =====
  // Lot: upper/lowerLot{오븐번호}{층번호}

  // 상부 LOT (오븐1)
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot11?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot12?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot13?: string;

  // 상부 LOT (오븐2)
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot21?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot22?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot23?: string;

  // 상부 LOT (오븐3)
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot31?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot32?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() upperLot33?: string;

  // 하부 LOT (오븐1)
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot11?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot12?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot13?: string;

  // 하부 LOT (오븐2)
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot21?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot22?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot23?: string;

  // 하부 LOT (오븐3)
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot31?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot32?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lowerLot33?: string;

  // 상부 투입량 (오븐1)
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty11?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty12?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty13?: number;

  // 상부 투입량 (오븐2)
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty21?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty22?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty23?: number;

  // 상부 투입량 (오븐3)
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty31?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty32?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperLotQty33?: number;

  // 하부 투입량 (오븐1)
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty11?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty12?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty13?: number;

  // 하부 투입량 (오븐2)
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty21?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty22?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty23?: number;

  // 하부 투입량 (오븐3)
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty31?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty32?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerLotQty33?: number;

  // ===== B. 생산 정보 (섹션3) =====

  // 상부 투입량 1~3층
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperInputQuantity1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperInputQuantity2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperInputQuantity3?: number;

  // 상부 수분측정 1~3층
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperMoistureMeasurement1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperMoistureMeasurement2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperMoistureMeasurement3?: number;

  // 하부 투입량 1~3층
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerInputQuantity1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerInputQuantity2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerInputQuantity3?: number;

  // 하부 수분측정 1~3층
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerMoistureMeasurement1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerMoistureMeasurement2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerMoistureMeasurement3?: number;

  // 상부 두께 before VD: upper/lowerThicknessBefore{층번호}F{오븐번호}
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore1F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore1F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore1F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore2F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore2F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore2F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore3F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore3F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessBefore3F3?: number;

  // 상부 두께 after VD
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter1F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter1F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter1F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter2F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter2F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter2F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter3F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter3F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperThicknessAfter3F3?: number;

  // 하부 두께 before VD
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore1F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore1F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore1F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore2F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore2F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore2F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore3F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore3F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessBefore3F3?: number;

  // 하부 두께 after VD
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter1F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter1F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter1F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter2F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter2F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter2F3?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter3F1?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter3F2?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerThicknessAfter3F3?: number;

  // 투입/배출 시간 (단일값, 예: "17:07 / 11:00")
  @ApiPropertyOptional({ description: '상부 투입/배출 시간 (예: 17:07 / 11:00)', example: '17:07 / 11:00' })
  @IsOptional()
  @IsString()
  upperInputOutputTime?: string;

  @ApiPropertyOptional({ description: '하부 투입/배출 시간 (예: 17:07 / 11:00)', example: '17:07 / 11:00' })
  @IsOptional()
  @IsString()
  lowerInputOutputTime?: string;

  // ===== C. 공정 조건 (섹션4) =====

  @ApiPropertyOptional() @IsOptional() @IsNumber() vacuumDegreeSetting?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() upperSetTemperature?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lowerSetTemperature?: number;

  @ApiPropertyOptional({ description: '상부 타이머 시간 (시간 단위 숫자, 예: 12)', example: 12 })
  @IsOptional()
  @IsNumber()
  upperTimerTime?: number;

  @ApiPropertyOptional({ description: '하부 타이머 시간 (시간 단위 숫자, 예: 12)', example: 12 })
  @IsOptional()
  @IsNumber()
  lowerTimerTime?: number;

  // ===== D. 설비 정보 (섹션5) =====

  @ApiPropertyOptional({ description: '상부 설비번호' })
  @IsOptional()
  @IsString()
  equipmentUpperNumber?: string;

  @ApiPropertyOptional({ description: '하부 설비번호' })
  @IsOptional()
  @IsString()
  equipmentLowerNumber?: string;
}

export class UpdateVdWorklogDto extends PartialType(CreateVdWorklogDto) {}

export class VdWorklogListResponseDto extends BaseWorklogListResponseDto {}
