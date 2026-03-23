import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSpecificationDto, UpdateSpecificationDto } from 'src/common/dtos/specification.dto';
import { ProjectSpecification } from 'src/common/entities/project-specifications.entity';
import { Project } from 'src/common/entities/project.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class ProductSpecificationService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectSpecification)
    private readonly projectSpecRepository: Repository<ProjectSpecification>,
  ) {}

  async createSpecification(projectId: number, dto: CreateSpecificationDto) {
    try {
      const project = await this.projectRepository.findOneByOrFail({ id: projectId });
      const projectSpec = await this.projectSpecRepository.create({
        project,
        cathode: dto.cathode,
        anode: dto.anode,
        assembly: dto.assembly,
        cell: dto.cell,
      });
      return await this.projectSpecRepository.save(projectSpec);
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
      if (error instanceof QueryFailedError) throw new ConflictException('이미 등록된 생산 계획이 있습니다.');
      throw error;
    }
  }

  async findOneSpecification(projectId: number) {
    try {
      return await this.projectSpecRepository.findOneOrFail({ where: { project: { id: projectId } } });
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('해당 생산 계획을 찾을 수 없습니다.');
    }
  }

  async updateSpecification(projectId: number, dto: UpdateSpecificationDto) {
    const spec = await this.projectSpecRepository.findOne({
      where: { project: { id: projectId } },
    });
    if (!spec) throw new NotFoundException('해당 프로젝트의 설계 정보가 없습니다.');

    Object.assign(spec, {
      cathode: dto.cathode ?? spec.cathode,
      anode: dto.anode ?? spec.anode,
      assembly: dto.assembly ?? spec.assembly,
      cell: dto.cell ?? spec.cell,
    });
    return await this.projectSpecRepository.save(spec);
  }

  async removeSpecification(projectId: number) {
    const spec = await this.projectSpecRepository.findOne({ where: { project: { id: projectId } } });
    if (!spec) throw new NotFoundException('삭제할 설계 정보를 찾을 수 없습니다.');

    return await this.projectSpecRepository.softRemove(spec);
  }
}
