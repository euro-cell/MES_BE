import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from 'src/common/entities/maintenance.entity';
import { CreateMaintenanceDto } from 'src/common/dtos/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create(createMaintenanceDto);
    return this.maintenanceRepository.save(maintenance);
  }

  async findAll() {
    const maintenances = await this.maintenanceRepository.find({
      relations: ['equipment'],
      order: { inspectionDate: 'ASC' },
    });

    return maintenances.map((m) => ({
      id: m.id,
      equipmentId: m.equipmentId,
      assetNo: m.equipment?.assetNo,
      equipmentNo: m.equipment?.equipmentNo,
      equipmentName: m.equipment?.name,
      inspectionDate: m.inspectionDate,
      replacementHistory: m.replacementHistory,
      usedParts: m.usedParts,
      maintainer: m.maintainer,
      verifier: m.verifier,
      remark: m.remark,
    }));
  }
}
