import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotFormation } from 'src/common/entities/lots/lot-08-formation.entity';
import { OqcSpec } from 'src/common/entities/oqc-spec.entity';
import { SaveOqcSpecDto } from 'src/common/dtos/oqc-spec.dto';

@Injectable()
export class OqcService {
  constructor(
    @InjectRepository(LotFormation)
    private readonly lotFormationRepository: Repository<LotFormation>,
    @InjectRepository(OqcSpec)
    private readonly oqcSpecRepository: Repository<OqcSpec>,
  ) {}

  async getGradingData(projectId: number) {
    const lots = await this.lotFormationRepository.find({
      where: { project: { id: projectId } },
      order: { lot: 'ASC' },
    });

    return lots.map((lot) => ({
      lotNo: lot.lot,
      capacity: lot.socCapacity,
      acIr: lot.dcIr,
      ocv3: lot.ocv3,
    }));
  }

  async getSpec(projectId: number): Promise<OqcSpec[]> {
    return this.oqcSpecRepository.find({
      where: { project: { id: projectId } },
    });
  }

  async upsertSpec(projectId: number, dto: SaveOqcSpecDto): Promise<OqcSpec> {
    const existing = await this.oqcSpecRepository.findOne({
      where: {
        project: { id: projectId },
        processType: dto.processType,
        itemType: dto.itemType,
      },
    });

    if (existing) {
      existing.specs = dto.specs;
      return this.oqcSpecRepository.save(existing);
    }

    const newSpec = this.oqcSpecRepository.create({
      project: { id: projectId },
      processType: dto.processType,
      itemType: dto.itemType,
      specs: dto.specs,
    });

    return this.oqcSpecRepository.save(newSpec);
  }
}
