import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import camelcaseKeys from 'camelcase-keys';
import { IsNumber, IsString } from 'class-validator';

class ValueRemarkDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => (value === '' ? 0 : Number(value)))
  value: number;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  remark: string;
}

class ValuePairRemarkDto {
  @ApiProperty()
  value1: number;

  @ApiProperty()
  value2: number;

  @ApiProperty()
  remark: string;
}

class EnergyDensityDto {
  @ApiProperty()
  @Type(() => ValueRemarkDto)
  gravimetric: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  volumetric: ValueRemarkDto;
}

class CathodeDto {
  @ApiProperty()
  @Type(() => ValueRemarkDto)
  @Transform(({ value }) => ({ ...value, value: Number(value?.value || 0) }))
  activeMaterial1: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  activeMaterial2: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  conductor: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  binder: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  loadingLevel: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  thickness: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  electrodeDensity: ValueRemarkDto;
}

class AnodeDto {
  @ApiProperty()
  @Type(() => ValueRemarkDto)
  activeMaterial: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  conductor: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  binder: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  loadingLevel: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  thickness: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  electrodeDensity: ValueRemarkDto;
}

class AssemblyDto {
  @ApiProperty()
  @Type(() => ValuePairRemarkDto)
  stackNo: ValuePairRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  separator: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  electrolyte: ValueRemarkDto;
}

class CellDto {
  @ApiProperty()
  @Type(() => ValueRemarkDto)
  npRatio: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  nominalCapacity: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  weight: ValueRemarkDto;

  @ApiProperty()
  @Type(() => ValueRemarkDto)
  thickness: ValueRemarkDto;

  @ApiProperty()
  @Type(() => EnergyDensityDto)
  energyDensity: EnergyDensityDto;
}

export class CreateBatteryDesignDto {
  @ApiProperty()
  @Transform(({ value }) =>
    camelcaseKeys(value, {
      deep: true,
      stopPaths: [],
      process: (key, val) => (key === 'value' && val !== '' ? Number(val) : val),
    }),
  )
  @Type(() => CathodeDto)
  cathode: CathodeDto;

  @ApiProperty()
  @Transform(({ value }) => camelcaseKeys(value, { deep: true }))
  @Type(() => AnodeDto)
  anode: AnodeDto;

  @ApiProperty()
  @Transform(({ value }) => camelcaseKeys(value, { deep: true }))
  @Type(() => AssemblyDto)
  assembly: AssemblyDto;

  @ApiProperty()
  @Transform(({ value }) => camelcaseKeys(value, { deep: true }))
  @Type(() => CellDto)
  cell: CellDto;
}
