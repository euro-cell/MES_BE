import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { copyFileSync, createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { MaterialCoa } from 'src/common/entities/material-coa.entity';
import { CreateCoaDto } from 'src/common/dtos/coa.dto';

@Injectable()
export class CoaService {
  constructor(
    @InjectRepository(MaterialCoa)
    private readonly coaRepository: Repository<MaterialCoa>,
  ) {}

  async findByMaterialId(materialId: number): Promise<MaterialCoa[]> {
    return this.coaRepository.find({
      where: { material: { id: materialId } },
      order: { createdAt: 'DESC' },
    });
  }

  async upload(dto: CreateCoaDto, file: Express.Multer.File): Promise<MaterialCoa> {
    const relativeDir = join('data', 'uploads', 'coa');
    const absoluteDir = join(process.cwd(), relativeDir);

    mkdirSync(absoluteDir, { recursive: true });

    const fileName = file.filename;
    const absolutePath = join(absoluteDir, fileName);
    const filePath = join(relativeDir, fileName).replace(/\\/g, '/');

    copyFileSync(file.path, absolutePath);
    unlinkSync(file.path);

    const coa = this.coaRepository.create({
      material: { id: dto.materialId },
      process: dto.process,
      fileName: file.originalname,
      filePath,
    });
    return this.coaRepository.save(coa);
  }

  async download(id: number): Promise<{ stream: StreamableFile; fileName: string }> {
    const coa = await this.coaRepository.findOne({ where: { id } });
    if (!coa) throw new NotFoundException(`CoA with id ${id} not found`);

    const absolutePath = join(process.cwd(), coa.filePath);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException('파일이 서버에 존재하지 않습니다.');
    }

    const stream = createReadStream(absolutePath);
    return { stream: new StreamableFile(stream), fileName: coa.fileName };
  }

  async remove(id: number): Promise<void> {
    const coa = await this.coaRepository.findOne({ where: { id } });
    if (!coa) throw new NotFoundException(`CoA with id ${id} not found`);

    const absolutePath = join(process.cwd(), coa.filePath);
    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath);
    }

    await this.coaRepository.delete(id);
  }
}
