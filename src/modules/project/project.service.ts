import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../common/entities/project/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto, UpdateProjectDto } from 'src/common/dtos/project/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll() {
    const projects = await this.projectRepository.find({ order: { id: 'DESC' }, relations: ['plan'] });
    return projects.map(({ plan, ...rest }) => ({
      ...rest,
      isPlan: !!plan,
      startDate: plan?.startDate || null,
      endDate: plan?.endDate || null,
    }));
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
    const monthCode = monthNum >= 1 && monthNum <= 12 ? String.fromCharCode(64 + monthNum) : 'X';

    // 용량 앞 2자리 (예: 3800 → 38)
    const capShort = String(capacity).slice(0, 2);

    return `${company}${type}${yearShort}${monthCode}${round}-${batteryType}${capShort}`;
  }

  async create(dto: CreateProjectDto) {
    const company = dto.company.toUpperCase();
    const mode = dto.mode.toUpperCase() as 'OEM' | 'ODM';
    const batteryType = dto.batteryType.toUpperCase();
    const type = mode === 'OEM' ? 'E' : 'D';

    const name = this.generateProjectName({
      company,
      type,
      year: dto.year,
      month: dto.month,
      round: Number(dto.round),
      batteryType,
      capacity: Number(dto.capacity),
    });

    const project = this.projectRepository.create({
      name,
      company,
      mode,
      year: dto.year,
      month: dto.month,
      round: dto.round,
      batteryType,
      capacity: dto.capacity,
      targetQuantity: dto.targetQuantity,
    });

    return this.projectRepository.save(project);
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`ID ${id}번 프로젝트 항목을 찾을 수 없습니다.`);
    }
    const updated = Object.assign(project, dto);
    return await this.projectRepository.save(updated);
  }

  async remove(id: number) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
    await this.projectRepository.softDelete(id);
    return { success: true };
  }

  async getSpecificationSummary() {
    const projects = await this.projectRepository.find({
      select: { id: true, name: true },
      relations: ['projectSpecifications', 'projectMaterials'],
      order: { id: 'DESC' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      specStatus: !!p.projectSpecifications,
      materialStatus: (p.projectMaterials?.length ?? 0) > 0,
    }));
  }
}
