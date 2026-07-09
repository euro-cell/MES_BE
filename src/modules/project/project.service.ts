import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../common/entities/project/project.entity';
import { Customer } from '../../common/entities/shared/customer.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto, UpdateProjectDto } from 'src/common/dtos/project/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll() {
    const projects = await this.projectRepository.find({ order: { id: 'DESC' }, relations: ['plan', 'customer'] });
    return projects.map(({ plan, customer, ...rest }) => ({
      ...rest,
      customerName: customer?.name ?? null,
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

    const existing = await this.projectRepository.findOne({ where: { name }, withDeleted: true });
    if (existing) throw new ConflictException(`이미 존재하는 프로젝트명입니다: ${name}`);

    let customer: Customer | null = null;
    if (dto.customerId != null) {
      customer = await this.customerRepository.findOne({ where: { id: dto.customerId } });
      if (!customer) throw new NotFoundException(`ID ${dto.customerId}번 고객사를 찾을 수 없습니다.`);
    }

    const project = this.projectRepository.create({
      name,
      company,
      mode,
      year: Number(dto.year),
      month: Number(dto.month),
      round: Number(dto.round),
      batteryType,
      capacity: Number(dto.capacity),
      targetQuantity: Number(dto.targetQuantity),
      customer,
    });

    return this.projectRepository.save(project);
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id }, relations: ['customer'] });
    if (!project) {
      throw new NotFoundException(`ID ${id}번 프로젝트 항목을 찾을 수 없습니다.`);
    }

    const nameFields = ['company', 'mode', 'year', 'month', 'round', 'batteryType', 'capacity'] as const;
    const affectsName = nameFields.some((f) => dto[f] !== undefined);

    const { customerId, ...rest } = dto;
    const updated = Object.assign(project, rest);

    if (customerId !== undefined) {
      if (customerId === null) {
        updated.customer = null;
      } else {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (!customer) throw new NotFoundException(`ID ${customerId}번 고객사를 찾을 수 없습니다.`);
        updated.customer = customer;
      }
    }

    if (affectsName) {
      const company = updated.company.toUpperCase();
      const mode = updated.mode.toUpperCase() as 'OEM' | 'ODM';
      const batteryType = updated.batteryType.toUpperCase();
      const type = mode === 'OEM' ? 'E' : 'D';

      const newName = this.generateProjectName({
        company,
        type,
        year: Number(updated.year),
        month: Number(updated.month),
        round: Number(updated.round),
        batteryType,
        capacity: Number(updated.capacity),
      });

      if (newName !== project.name) {
        const existing = await this.projectRepository.findOne({ where: { name: newName }, withDeleted: true });
        if (existing) throw new ConflictException(`이미 존재하는 프로젝트명입니다: ${newName}`);
      }

      updated.name = newName;
      updated.company = company;
      updated.mode = mode;
      updated.batteryType = batteryType;
    }

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
      relations: ['projectSpecifications', 'projectMaterials', 'projectBoms'],
      order: { id: 'DESC' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      specStatus: !!p.projectSpecifications,
      materialStatus: (p.projectMaterials?.length ?? 0) > 0,
      bomStatus: (p.projectBoms?.length ?? 0) > 0,
    }));
  }
}
