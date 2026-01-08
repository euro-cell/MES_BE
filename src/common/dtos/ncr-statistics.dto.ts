import { ApiProperty } from '@nestjs/swagger';

export class ProjectCountDto {
  @ApiProperty({ description: '프로젝트 번호', example: 'V5', nullable: true })
  projectNo: string | null;

  @ApiProperty({ description: '프로젝트명', example: '5.2' })
  projectName: string;

  @ApiProperty({ description: '수량', example: 5 })
  count: number;
}

export class NcrStatisticsDto {
  @ApiProperty({ description: 'NCR ID', example: 1 })
  id: number;

  @ApiProperty({ description: '분류', example: 'Formation' })
  category: string;

  @ApiProperty({ description: '종류', example: 'NCR1' })
  ncrType: string;

  @ApiProperty({ description: '제목', example: 'PF 방전용량(Ah)' })
  title: string;

  @ApiProperty({ description: '코드', example: 'F-NCR1' })
  code: string;

  @ApiProperty({ type: [ProjectCountDto], description: '프로젝트별 카운트' })
  counts: ProjectCountDto[];
}

export class ProjectDto {
  @ApiProperty({ description: '프로젝트 번호', example: 'V5', nullable: true })
  projectNo: string | null;

  @ApiProperty({ description: '프로젝트명', example: '5.2' })
  projectName: string;
}

export class NcrStatisticsResponseDto {
  @ApiProperty({ type: [NcrStatisticsDto], description: 'NCR 통계 목록' })
  data: NcrStatisticsDto[];

  @ApiProperty({ type: [ProjectDto], description: '프로젝트 목록' })
  projects: ProjectDto[];
}
