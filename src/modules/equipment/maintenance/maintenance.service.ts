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
}
