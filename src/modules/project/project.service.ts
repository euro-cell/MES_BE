import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../common/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  findAll() {
    return this.projectRepo.find({ order: { id: 'DESC' } });
  }

  private generateProjectName({
    company,
    type,
    year,
    month,
    round,
    batteryType,
    capacity,
  }: {
    company: string;
    type: 'E' | 'D';
    year: number;
    month: number;
    round: number;
    batteryType: string;
    capacity: number;
  }) {
    const yearShort = String(year).slice(-2);

    // 1~12 → A~L 변환, 이외는 'X'
    const monthNum = Number(month);
    const monthCode =
      monthNum >= 1 && monthNum <= 12
        ? String.fromCharCode(64 + monthNum)
        : 'X';

    // 용량 앞 2자리 (예: 3800 → 38)
    const capShort = String(capacity).slice(0, 2);

    // ✅ 하이픈 추가 버전
    return `${company}${type}${yearShort}${monthCode}${round}-${batteryType}${capShort}`;
  }

  async create(data: {
    company: string;
    mode: 'OME' | 'ODM';
    year: number;
    month: number;
    round: number;
    batteryType: string;
    capacity: number;
  }) {
    const company = data.company.toUpperCase();
    const mode = data.mode.toUpperCase() as 'OME' | 'ODM';
    const batteryType = data.batteryType.toUpperCase();
    const type = mode === 'OME' ? 'E' : 'D';

    // 이름 규칙: NA + E + 25 + A + 1 + TNP + 38
    const name = this.generateProjectName({
      company,
      type,
      year: data.year,
      month: data.month,
      round: Number(data.round),
      batteryType,
      capacity: Number(data.capacity),
    });

    const project = this.projectRepo.create({
      name,
      company,
      mode,
      year: data.year,
      month: data.month,
      round: data.round,
      batteryType,
      capacity: data.capacity,
    });

    return this.projectRepo.save(project);
  }

  async remove(id: number) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
    await this.projectRepo.remove(project);
    return { success: true };
  }
}
