import { PartialType, ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessTemplateItemDto {
  @ApiProperty({ description: '공정 그룹 (예: Electrode, Cell Assembly, Cell Formation)' })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiProperty({ description: '공정명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '구분 목록 (빈 배열이면 구분 없음, 예: ["Anode","Cathode"])', type: [String] })
  @IsArray()
  @IsString({ each: true })
  types: string[];

  @ApiProperty({ description: '표시 순서' })
  @IsInt()
  order: number;
}

export class CreateProcessTemplateDto {
  @ApiProperty({ description: '템플릿 이름 (예: 파우치형 표준)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '전지 종류 (예: 파우치형, 원통형)' })
  @IsString()
  @IsNotEmpty()
  formFactor: string;

  @ApiProperty({ description: '공정 항목 리스트', type: [ProcessTemplateItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProcessTemplateItemDto)
  items: ProcessTemplateItemDto[];
}

export class UpdateProcessTemplateDto extends PartialType(CreateProcessTemplateDto) {}
