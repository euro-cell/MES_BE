import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBatteryDesignDto } from 'src/common/dtos/specification.dto';
import { Project } from 'src/common/entities/project.entity';
import { Specification } from 'src/common/entities/specification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(Specification)
    private readonly specificationRepository: Repository<Specification>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<any>,
  ) {}

  async createSpecification(projectId: number, dto: CreateBatteryDesignDto) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('해당 생산 정보를 찾을 수 없습니다.');

    let specification = await this.specificationRepository.findOne({
      where: { project: { id: projectId } },
      withDeleted: true,
    });

    if (specification) {
      if (specification.deletedAt) {
        specification.deletedAt = null;
      }
      specification.cathode = dto.cathode;
      specification.anode = dto.anode;
      specification.assembly = dto.assembly;
      specification.cell = dto.cell;
    } else {
      specification = this.specificationRepository.create({
        project,
        cathode: dto.cathode,
        anode: dto.anode,
        assembly: dto.assembly,
        cell: dto.cell,
      });
    }
    return await this.specificationRepository.save(specification);
  }

  async findSpecification(projectId: number) {
    const specification = await this.specificationRepository.findOne({ where: { project: { id: projectId } } });
    if (!specification) throw new NotFoundException('해당 생산 정보의 전지 설계 정보를 찾을 수 없습니다.');
    return specification;
  }

  async softDeleteSpecification(projectId: number) {
    const specification = await this.specificationRepository.findOne({
      where: { project: { id: projectId } },
      relations: ['project'],
    });

    if (!specification) {
      throw new NotFoundException('해당 프로덕션에 대한 전지 설계를 찾을 수 없습니다.');
    }

    await this.specificationRepository.softRemove(specification);
    return { message: '해당 프로젝트의 전지 설계가 삭제되었습니다.' };
  }
}
