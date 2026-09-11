import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessTemplate } from '../../common/entities/project/process-template.entity';
import { ProjectPlan } from '../../common/entities/project/project-plan.entity';
import { CreateProcessTemplateDto, UpdateProcessTemplateDto } from '../../common/dtos/project/process-template.dto';

@Injectable()
export class ProcessTemplateService {
  constructor(
    @InjectRepository(ProcessTemplate)
    private readonly templateRepository: Repository<ProcessTemplate>,
    @InjectRepository(ProjectPlan)
    private readonly planRepository: Repository<ProjectPlan>,
  ) {}

  async findAll() {
    return this.templateRepository.find({
      relations: ['items'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const template = await this.templateRepository.findOne({ where: { id }, relations: ['items'] });
    if (!template) throw new NotFoundException('공정 템플릿을 찾을 수 없습니다.');
    return template;
  }

  async create(dto: CreateProcessTemplateDto) {
    const template = this.templateRepository.create({
      name: dto.name,
      formFactor: dto.formFactor,
      items: dto.items,
    });
    return this.templateRepository.save(template);
  }

  async update(id: number, dto: UpdateProcessTemplateDto) {
    const template = await this.findOne(id);

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.formFactor !== undefined) template.formFactor = dto.formFactor;
    if (dto.items !== undefined) template.items = dto.items as any;

    return this.templateRepository.save(template);
  }

  async remove(id: number) {
    const template = await this.findOne(id);

    const referencingCount = await this.planRepository.count({ where: { template: { id } } });
    if (referencingCount > 0) {
      throw new BadRequestException('이미 생산계획에서 사용 중인 템플릿은 삭제할 수 없습니다.');
    }

    return this.templateRepository.remove(template);
  }
}
