import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValueRemarkDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsOptional()
  value: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  remark: string;
}

export class ElectrodeGroupDto {
  @ApiProperty({ type: [ValueRemarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueRemarkDto)
  activeMaterial: ValueRemarkDto[];

  @ApiProperty({ type: [ValueRemarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueRemarkDto)
  conductor: ValueRemarkDto[];

  @ApiProperty({ type: [ValueRemarkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueRemarkDto)
  binder: ValueRemarkDto[];

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  loadingLevel: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  thickness: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  electrodeDensity: ValueRemarkDto;
}

export class StackNoDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  value1: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  value2: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  remark: string;
}

export class AssemblyDto {
  @ApiProperty({ type: StackNoDto })
  @Type(() => StackNoDto)
  stackNo: StackNoDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  separator: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  electrolyte: ValueRemarkDto;
}

export class EnergyDensityDto {
  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  gravimetric: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  volumetric: ValueRemarkDto;
}

export class CellDto {
  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  npRatio: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  nominalCapacity: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  weight: ValueRemarkDto;

  @ApiProperty({ type: ValueRemarkDto })
  @Type(() => ValueRemarkDto)
  thickness: ValueRemarkDto;

  @ApiProperty({ type: EnergyDensityDto })
  @Type(() => EnergyDensityDto)
  energyDensity: EnergyDensityDto;
}

export class CreateSpecificationDto {
  @ApiProperty({ type: ElectrodeGroupDto })
  @Type(() => ElectrodeGroupDto)
  cathode: ElectrodeGroupDto;

  @ApiProperty({ type: ElectrodeGroupDto })
  @Type(() => ElectrodeGroupDto)
  anode: ElectrodeGroupDto;

  @ApiProperty({ type: AssemblyDto })
  @Type(() => AssemblyDto)
  assembly: AssemblyDto;

  @ApiProperty({ type: CellDto })
  @Type(() => CellDto)
  cell: CellDto;
}

export class CreateBatteryDesignDto {
  @ApiProperty({ type: ElectrodeGroupDto })
  @Type(() => ElectrodeGroupDto)
  cathode: ElectrodeGroupDto;

  @ApiProperty({ type: ElectrodeGroupDto })
  @Type(() => ElectrodeGroupDto)
  anode: ElectrodeGroupDto;

  @ApiProperty({ type: AssemblyDto })
  @Type(() => AssemblyDto)
  assembly: AssemblyDto;

  @ApiProperty({ type: CellDto })
  @Type(() => CellDto)
  cell: CellDto;
}
