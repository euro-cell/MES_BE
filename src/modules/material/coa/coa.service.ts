import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialCoa } from 'src/common/entities/material-coa.entity';
import { CreateCoaDto } from 'src/common/dtos/coa.dto';
import { RustfsService } from 'src/common/services/rustfs.service';

@Injectable()
export class CoaService {
  constructor(
    @InjectRepository(MaterialCoa)
    private readonly coaRepository: Repository<MaterialCoa>,
    private readonly rustfsService: RustfsService,
  ) {}

  async findByMaterialId(materialId: number): Promise<MaterialCoa[]> {
    return this.coaRepository.find({
      where: { material: { id: materialId } },
      order: { createdAt: 'DESC' },
    });
  }

  async upload(dto: CreateCoaDto, file: Express.Multer.File): Promise<MaterialCoa> {
    const { key } = await this.rustfsService.uploadFile(`coa/${dto.materialId}`, file);

    const coa = this.coaRepository.create({
      material: { id: dto.materialId },
      process: dto.process,
      fileName: file.originalname,
      filePath: key,
    });
    return this.coaRepository.save(coa);
  }

  async download(id: number): Promise<{ stream: StreamableFile; fileName: string }> {
    const coa = await this.coaRepository.findOne({ where: { id } });
    if (!coa) throw new NotFoundException(`CoA with id ${id} not found`);

    return this.rustfsService.download(coa.filePath, coa.fileName);
  }

  async remove(id: number): Promise<void> {
    const coa = await this.coaRepository.findOne({ where: { id } });
    if (!coa) throw new NotFoundException(`CoA with id ${id} not found`);

    await this.rustfsService.delete(coa.filePath);
    await this.coaRepository.delete(id);
  }
}
