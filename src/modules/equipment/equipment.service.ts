import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from 'src/common/entities/equipment.entity';
import { CreateEquipmentDto } from 'src/common/dtos/equipment.dto';
import { EquipmentCategory } from 'src/common/enums/equipment.enum';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async findByCategory(category: EquipmentCategory): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { category },
      order: { id: 'DESC' },
    });
  }
}
