import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentManual } from 'src/common/entities/equipment/equipment-manual.entity';
import { CreateManualDto } from 'src/common/dtos/equipment-manual.dto';
import { RustfsService } from 'src/common/services/rustfs.service';

@Injectable()
export class ManualService {
  constructor(
    @InjectRepository(EquipmentManual)
    private readonly manualRepository: Repository<EquipmentManual>,
    private readonly rustfsService: RustfsService,
  ) {}

  async findByEquipmentId(equipmentId: number) {
    const manuals = await this.manualRepository.find({
      where: { equipment: { id: equipmentId } },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      manuals.map(async (manual) => ({
        ...manual,
        fileUrl: manual.filePath ? await this.rustfsService.getPresignedUrl(manual.filePath) : null,
      })),
    );
  }

  async upload(dto: CreateManualDto, file: Express.Multer.File): Promise<EquipmentManual> {
    const { key } = await this.rustfsService.uploadFile(`manual/${dto.equipmentId}`, file);

    const manual = this.manualRepository.create({
      equipment: { id: dto.equipmentId },
      fileName: file.originalname,
      filePath: key,
    });
    return this.manualRepository.save(manual);
  }

  async download(id: number): Promise<{ stream: StreamableFile; fileName: string }> {
    const manual = await this.manualRepository.findOne({ where: { id } });
    if (!manual) throw new NotFoundException(`매뉴얼 id ${id}를 찾을 수 없습니다`);

    return this.rustfsService.download(manual.filePath, manual.fileName);
  }

  async remove(id: number): Promise<void> {
    const manual = await this.manualRepository.findOne({ where: { id } });
    if (!manual) throw new NotFoundException(`매뉴얼 id ${id}를 찾을 수 없습니다`);

    await this.rustfsService.delete(manual.filePath);
    await this.manualRepository.delete(id);
  }
}
