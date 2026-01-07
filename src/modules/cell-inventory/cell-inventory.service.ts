import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { CreateCellInventoryDto } from 'src/common/dtos/cell-inventory.dto';

@Injectable()
export class CellInventoryService {
  constructor(
    @InjectRepository(CellInventory)
    private readonly cellInventoryRepository: Repository<CellInventory>,
  ) {}

  async create(dto: CreateCellInventoryDto) {
    const existing = await this.cellInventoryRepository.findOne({
      where: { lot: dto.lot, projectName: dto.projectName },
    });
    if (existing) throw new ConflictException('이미 존재하는 셀입니다.');

    const cellInventory = this.cellInventoryRepository.create(dto);
    return await this.cellInventoryRepository.save(cellInventory);
  }
}
