import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotFormation } from 'src/common/entities/lots/lot-08-formation.entity';

@Injectable()
export class OqcService {
  constructor(
    @InjectRepository(LotFormation)
    private readonly lotFormationRepository: Repository<LotFormation>,
  ) {}

  async getGradingData(productionId: number) {
    const lots = await this.lotFormationRepository.find({
      where: { production: { id: productionId } },
      order: { lot: 'ASC' },
    });

    return lots.map((lot) => ({
      lotNo: lot.lot,
      capacity: lot.socCapacity,
      acIr: lot.dcIr,
      ocv3: lot.ocv3,
    }));
  }
}
