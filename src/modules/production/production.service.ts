import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Production } from '../../common/entities/production.entity';
import { Repository } from 'typeorm';
import { CreateProductionDto } from 'src/common/dtos/production.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Production)
    private readonly ProductionRepository: Repository<Production>,
  ) {}

  async findAll() {
    const productions = await this.ProductionRepository.find({ order: { id: 'DESC' }, relations: ['plan'] });
    return productions.map(({ plan, ...rest }) => ({ ...rest, isPlan: !!plan }));
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

    // ✅ 하이픈 추가 버전
    return `${company}${type}${yearShort}${monthCode}${round}-${batteryType}${capShort}`;
  }

  async create(dto: CreateProductionDto) {
    const company = dto.company.toUpperCase();
    const mode = dto.mode.toUpperCase() as 'OME' | 'ODM';
    const batteryType = dto.batteryType.toUpperCase();
    const type = mode === 'OME' ? 'E' : 'D';

    // 이름 규칙: NA + E + 25 + A + 1 + TNP + 38
    const name = this.generateProjectName({
      company,
      type,
      year: dto.year,
      month: dto.month,
      round: Number(dto.round),
      batteryType,
      capacity: Number(dto.capacity),
    });

    const project = this.ProductionRepository.create({
      name,
      company,
      mode,
      year: dto.year,
      month: dto.month,
      round: dto.round,
      batteryType,
      capacity: dto.capacity,
      targetQuantity: dto.targetQuantity,
    });

    return this.ProductionRepository.save(project);
  }

  async remove(id: number) {
    const project = await this.ProductionRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
    await this.ProductionRepository.remove(project);
    return { success: true };
  }
}
