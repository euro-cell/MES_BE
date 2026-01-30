import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { MaterialHistory } from 'src/common/entities/material-history.entity';
import { Production } from 'src/common/entities/production.entity';
import { MaterialProcess, MaterialHistoryType } from 'src/common/enums/material.enum';
import { Repository } from 'typeorm';
import { CreateMaterialDto, UpdateMaterialDto, ImportMaterialItemDto, ImportMaterialResultDto } from 'src/common/dtos/material.dto';
import { MaterialOrigin, MaterialPurpose } from 'src/common/enums/material.enum';
import { ExcelService } from 'src/common/services/excel.service';
import { ExcelUtil } from 'src/common/utils/excel.util';
import * as ExcelJS from 'exceljs';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(MaterialHistory)
    private readonly materialHistoryRepository: Repository<MaterialHistory>,
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    private readonly excelService: ExcelService,
  ) {}

  async findAllMaterials(category?: string) {
    const query = this.materialRepository.createQueryBuilder('material').where('material.deletedAt IS NULL');

    if (category) {
      query.andWhere('material.category = :category', { category });
      query.orderBy('material.name', 'ASC');
    } else {
      query.orderBy('material.id', 'ASC');
    }

    return query.getMany();
  }

  async findByElectrode(isZeroStock: boolean = false) {
    const query = this.materialRepository
      .createQueryBuilder('material')
      .where('material.process = :process', { process: MaterialProcess.ELECTRODE })
      .andWhere('material.deletedAt IS NULL');

    // 기본값: 재고가 있는 것만 조회
    if (!isZeroStock) {
      query.andWhere('material.stock > 0');
    }

    return query.orderBy('material.id', 'ASC').getMany();
  }

  async findByAssembly(isZeroStock: boolean = false) {
    const query = this.materialRepository
      .createQueryBuilder('material')
      .where('material.process = :process', { process: MaterialProcess.ASSEMBLY })
      .andWhere('material.deletedAt IS NULL');

    // 기본값: 재고가 있는 것만 조회
    if (!isZeroStock) {
      query.andWhere('material.stock > 0');
    }

    return query.orderBy('material.id', 'ASC').getMany();
  }

  async findByMaterialProduction() {
    const productions = await this.productionRepository.find({ order: { id: 'DESC' }, relations: ['productionMaterials'] });
    const result = productions.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      mode: p.mode,
      year: p.year,
      month: p.month,
      round: p.round,
      batteryType: p.batteryType,
      capacity: p.capacity,
      hasMaterials: p.productionMaterials && p.productionMaterials.length > 0,
    }));
    return result;
  }

  async getDistinctCategories() {
    const categories = await this.materialRepository
      .createQueryBuilder('material')
      .select('DISTINCT material.category', 'category')
      .orderBy('material.category', 'ASC')
      .getRawMany();
    return categories.map((c) => c.category);
  }

  /**
   * 카테고리/타입별 자재 LOT 목록 조회
   * - 재고가 있는(stock > 0) LOT만 조회
   * - 입고일(createdAt) 기준 오래된 순서로 정렬 (선입선출)
   */
  async getLotsByCategory(category?: string, type?: string) {
    const query = this.materialRepository
      .createQueryBuilder('material')
      .select([
        'material.id',
        'material.lotNo',
        'material.name',
        'material.stock',
        'material.createdAt',
        'material.company',
        'material.spec',
      ])
      .where('material.deletedAt IS NULL')
      .andWhere('material.stock > 0')
      .andWhere('material.lotNo IS NOT NULL');

    if (type) {
      query.andWhere('material.type = :type', { type });
    } else if (category) {
      query.andWhere('material.category = :category', { category });
    }

    const materials = await query.orderBy('material.createdAt', 'ASC').getMany();

    return materials.map((m) => ({
      id: m.id,
      lot: m.lotNo,
      name: m.name,
      receivedDate: m.createdAt,
      remainingQty: m.stock,
      manufacturer: m.company,
      spec: m.spec,
    }));
  }

  async createElectrodeMaterial(dto: CreateMaterialDto) {
    const material = this.materialRepository.create({
      ...dto,
      process: MaterialProcess.ELECTRODE,
    });
    const savedMaterial = await this.materialRepository.save(material);

    // 추가할 때 입고(IN) 이력 기록
    if (savedMaterial.stock && savedMaterial.stock > 0) {
      await this.materialHistoryRepository.save({
        materialId: savedMaterial.id,
        process: MaterialProcess.ELECTRODE,
        type: MaterialHistoryType.IN,
        previousStock: 0,
        currentStock: savedMaterial.stock,
      });
    }

    return savedMaterial;
  }

  async updateElectrodeMaterial(id: number, updateMaterialDto: UpdateMaterialDto) {
    // 기존 자재 조회 (이전 stock 값 저장)
    const existingMaterial = await this.materialRepository.findOne({ where: { id } });
    if (!existingMaterial) {
      throw new Error(`Material with id ${id} not found`);
    }

    const previousStock = existingMaterial.stock || 0;

    // 자재 업데이트
    await this.materialRepository.update(id, {
      ...updateMaterialDto,
      process: MaterialProcess.ELECTRODE,
    });

    const updatedMaterial = await this.materialRepository.findOne({ where: { id } });
    const currentStock = updatedMaterial?.stock || 0;

    // stock이 변경된 경우에만 이력 기록
    if (previousStock !== currentStock) {
      const historyType = currentStock > previousStock ? MaterialHistoryType.IN : MaterialHistoryType.OUT;

      await this.materialHistoryRepository.save({
        materialId: id,
        process: MaterialProcess.ELECTRODE,
        type: historyType,
        previousStock,
        currentStock,
      });
    }

    return updatedMaterial;
  }

  async deleteElectrodeMaterial(id: number, isHardDelete: boolean = false) {
    if (isHardDelete) {
      // 하드 딜리트: 데이터 완전 삭제
      return this.materialRepository.delete(id);
    } else {
      // 소프트 딜리트: deletedAt 설정
      return this.materialRepository.softDelete(id);
    }
  }

  async createAssemblyMaterial(dto: CreateMaterialDto) {
    const material = this.materialRepository.create({
      ...dto,
      process: MaterialProcess.ASSEMBLY,
    });
    const savedMaterial = await this.materialRepository.save(material);

    // 추가할 때 입고(IN) 이력 기록
    if (savedMaterial.stock && savedMaterial.stock > 0) {
      await this.materialHistoryRepository.save({
        materialId: savedMaterial.id,
        process: MaterialProcess.ASSEMBLY,
        type: MaterialHistoryType.IN,
        previousStock: 0,
        currentStock: savedMaterial.stock,
      });
    }

    return savedMaterial;
  }

  async updateAssemblyMaterial(id: number, updateMaterialDto: UpdateMaterialDto) {
    // 기존 자재 조회 (이전 stock 값 저장)
    const existingMaterial = await this.materialRepository.findOne({ where: { id } });
    if (!existingMaterial) {
      throw new Error(`Material with id ${id} not found`);
    }

    const previousStock = existingMaterial.stock || 0;

    // 자재 업데이트
    await this.materialRepository.update(id, {
      ...updateMaterialDto,
      process: MaterialProcess.ASSEMBLY,
    });

    const updatedMaterial = await this.materialRepository.findOne({ where: { id } });
    const currentStock = updatedMaterial?.stock || 0;

    // stock이 변경된 경우에만 이력 기록
    if (previousStock !== currentStock) {
      const historyType = currentStock > previousStock ? MaterialHistoryType.IN : MaterialHistoryType.OUT;

      await this.materialHistoryRepository.save({
        materialId: id,
        process: MaterialProcess.ASSEMBLY,
        type: historyType,
        previousStock,
        currentStock,
      });
    }

    return updatedMaterial;
  }

  async deleteAssemblyMaterial(id: number, isHardDelete: boolean = false) {
    if (isHardDelete) {
      // 하드 딜리트: 데이터 완전 삭제
      return this.materialRepository.delete(id);
    } else {
      // 소프트 딜리트: deletedAt 설정
      return this.materialRepository.softDelete(id);
    }
  }

  async getMaterialHistoryByProcess(process: MaterialProcess, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.materialHistoryRepository.findAndCount({
      where: { process },
      relations: ['material'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 자재 사용 이력 기록 (작업일지에서 사용할 때)
  async recordMaterialUsage(materialName: string, materialLot: string | undefined, usageAmount: number, process: MaterialProcess) {
    // materialName과 materialLot으로 자재 찾기
    const material = await this.materialRepository.findOne({
      where: {
        name: materialName,
        ...(materialLot ? { lotNo: materialLot } : {}),
      },
    });

    if (!material) {
      return null; // 자재를 찾지 못함
    }

    const previousStock = material.stock || 0;
    const currentStock = previousStock - usageAmount;

    // 재고 업데이트
    await this.materialRepository.update(material.id, {
      stock: Math.max(0, currentStock), // 음수 방지
    });

    // 사용 이력 기록
    await this.materialHistoryRepository.save({
      materialId: material.id,
      process,
      type: MaterialHistoryType.USE,
      previousStock,
      currentStock: Math.max(0, currentStock),
    });

    return material;
  }

  // 자재 사용 이력 수정 (작업일지 업데이트 시 기존 이력 수정)
  async updateMaterialUsageHistory(
    materialName: string,
    materialLot: string | undefined,
    newUsageAmount: number,
    process: MaterialProcess,
    historyId?: number,
  ) {
    // materialName과 materialLot으로 자재 찾기
    const material = await this.materialRepository.findOne({
      where: {
        name: materialName,
        ...(materialLot ? { lotNo: materialLot } : {}),
      },
    });

    if (!material) {
      return null;
    }

    const currentStock = material.stock || 0;
    // 현재 재고에서 새로운 사용량을 직접 차감
    const updatedStock = Math.max(0, currentStock - newUsageAmount);
    await this.materialRepository.update(material.id, {
      stock: updatedStock,
    });

    // 기존 이력이 있으면 수정, 없으면 새로 생성
    if (historyId) {
      await this.materialHistoryRepository.update(historyId, {
        previousStock: currentStock,
        currentStock: updatedStock,
      });
    } else {
      // 기존 USE 이력 찾아서 수정 (가장 최근에 수정된 해당 자재 이력)
      const existingHistory = await this.materialHistoryRepository.findOne({
        where: {
          materialId: material.id,
          process,
          type: MaterialHistoryType.USE,
        },
        order: { updatedAt: 'DESC' },
      });

      if (existingHistory) {
        await this.materialHistoryRepository.update(existingHistory.id, {
          previousStock: currentStock,
          currentStock: updatedStock,
        });
      } else {
        await this.materialHistoryRepository.save({
          materialId: material.id,
          process,
          type: MaterialHistoryType.USE,
          previousStock: currentStock,
          currentStock: updatedStock,
        });
      }
    }

    return material;
  }

  async exportElectrodeMaterial(): Promise<StreamableFile> {
    const materials = await this.findByElectrode(true); // 재고 0인 것도 포함

    return this.excelService.generateSimpleExcel({
      templateName: 'material/electrode.xlsx',
      data: materials,
      dataMapper: (material, row, rowIndex) => {
        this.mapMaterialToRow(material, row, rowIndex);
      },
      headerRows: 2,
      autoColumnWidth: true,
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    });
  }

  async exportAssemblyMaterial(): Promise<StreamableFile> {
    const materials = await this.findByAssembly(true); // 재고 0인 것도 포함

    return this.excelService.generateSimpleExcel({
      templateName: 'material/assembly.xlsx',
      data: materials,
      dataMapper: (material, row, rowIndex) => {
        this.mapMaterialToRow(material, row, rowIndex);
      },
      headerRows: 2,
      autoColumnWidth: true,
      columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    });
  }

  private mapMaterialToRow(material: Material, row: ExcelJS.Row, rowIndex: number): void {
    // A열: 번호 (1부터 시작)
    row.getCell('A').value = rowIndex + 1;

    // B~M열: 자재 데이터
    row.getCell('B').value = ExcelUtil.sanitizeValue(material.category); // 자재(중분류)
    row.getCell('C').value = ExcelUtil.sanitizeValue(material.type); // 종류(소분류)
    row.getCell('D').value = ExcelUtil.sanitizeValue(material.purpose); // 용도
    row.getCell('E').value = ExcelUtil.sanitizeValue(material.name); // 제품명
    row.getCell('F').value = ExcelUtil.sanitizeValue(material.spec); // 규격
    row.getCell('G').value = ExcelUtil.sanitizeValue(material.lotNo); // Lot No.
    row.getCell('H').value = ExcelUtil.sanitizeValue(material.company); // 제조/공급처
    row.getCell('I').value = ExcelUtil.sanitizeValue(material.origin); // 국내/외
    row.getCell('J').value = ExcelUtil.sanitizeValue(material.unit); // 단위
    row.getCell('K').value = material.price ? Math.floor(Number(material.price)) : ''; // 가격 (정수)
    row.getCell('L').value = ExcelUtil.sanitizeValue(material.note); // 비고
    row.getCell('M').value = material.stock ? Math.floor(Number(material.stock)) : 0; // 재고 (정수)

    // A열부터 M열까지 테두리 적용
    for (let col = 'A'.charCodeAt(0); col <= 'M'.charCodeAt(0); col++) {
      const cell = row.getCell(String.fromCharCode(col));
      ExcelUtil.applyCellBorder(cell);
    }
  }

  getElectrodeExportFilename(): string {
    return '전극_재고관리.xlsx';
  }

  getAssemblyExportFilename(): string {
    return '조립_재고관리.xlsx';
  }

  /**
   * 전극 자재 일괄 등록/수정 (Upsert)
   * - lotNo + category 조합으로 기존 데이터 식별
   * - 해당 조합이 없으면 INSERT, 있으면 UPDATE
   * - 트랜잭션 처리 (전체 성공 또는 전체 롤백)
   */
  async importElectrodeMaterials(materials: ImportMaterialItemDto[]): Promise<ImportMaterialResultDto> {
    return this.importMaterials(materials, MaterialProcess.ELECTRODE);
  }

  /**
   * 조립 자재 일괄 등록/수정 (Upsert)
   * - lotNo + category 조합으로 기존 데이터 식별
   * - 해당 조합이 없으면 INSERT, 있으면 UPDATE
   * - 트랜잭션 처리 (전체 성공 또는 전체 롤백)
   */
  async importAssemblyMaterials(materials: ImportMaterialItemDto[]): Promise<ImportMaterialResultDto> {
    return this.importMaterials(materials, MaterialProcess.ASSEMBLY);
  }

  /**
   * 자재 일괄 등록/수정 공통 로직
   */
  private async importMaterials(
    materials: ImportMaterialItemDto[],
    process: MaterialProcess,
  ): Promise<ImportMaterialResultDto> {
    const queryRunner = this.materialRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let created = 0;
    let updated = 0;

    try {
      for (const item of materials) {
        // lotNo + category 조합으로 기존 자재 조회
        const existingMaterial = await queryRunner.manager.findOne(Material, {
          where: {
            lotNo: item.lotNo,
            category: item.category,
            process,
            deletedAt: null,
          } as any,
        });

        // origin 값 변환 (문자열 -> enum)
        const originValue = this.parseOrigin(item.origin);
        // purpose 값 변환 (문자열 -> enum)
        const purposeValue = this.parsePurpose(item.purpose);

        if (existingMaterial) {
          // UPDATE: 기존 데이터와 비교하여 변경 여부 확인
          const previousStock = existingMaterial.stock || 0;
          const currentStock = item.stock ?? 0;

          const hasChanges =
            existingMaterial.type !== (item.type ?? '') ||
            existingMaterial.purpose !== purposeValue ||
            existingMaterial.name !== (item.name ?? '') ||
            existingMaterial.spec !== (item.spec ?? '') ||
            existingMaterial.company !== (item.company ?? '') ||
            existingMaterial.origin !== originValue ||
            existingMaterial.unit !== (item.unit ?? '') ||
            Number(existingMaterial.price) !== (item.price ?? 0) ||
            existingMaterial.note !== (item.note ?? '') ||
            previousStock !== currentStock;

          if (hasChanges) {
            await queryRunner.manager.update(Material, existingMaterial.id, {
              type: item.type ?? '',
              purpose: purposeValue,
              name: item.name ?? '',
              spec: item.spec ?? undefined,
              company: item.company ?? undefined,
              origin: originValue,
              unit: item.unit ?? '',
              price: item.price ?? undefined,
              note: item.note ?? undefined,
              stock: currentStock,
            });

            // 재고 변경 시 이력 기록 (IMPORT 타입)
            if (previousStock !== currentStock) {
              await queryRunner.manager.save(MaterialHistory, {
                materialId: existingMaterial.id,
                process,
                type: MaterialHistoryType.IMPORT,
                previousStock,
                currentStock,
              });
            }

            updated++;
          }
        } else {
          // INSERT: 신규 등록
          const newMaterial = new Material();
          newMaterial.process = process;
          newMaterial.category = item.category;
          newMaterial.type = item.type ?? '';
          newMaterial.purpose = purposeValue;
          newMaterial.name = item.name ?? '';
          newMaterial.spec = item.spec ?? '';
          newMaterial.lotNo = item.lotNo;
          newMaterial.company = item.company ?? '';
          newMaterial.origin = originValue;
          newMaterial.unit = item.unit ?? '';
          newMaterial.price = item.price ?? 0;
          newMaterial.note = item.note ?? '';
          newMaterial.stock = item.stock ?? 0;

          const savedMaterial = await queryRunner.manager.save(Material, newMaterial);

          // 재고가 있으면 일괄등록 이력 기록 (IMPORT 타입)
          if (savedMaterial.stock && savedMaterial.stock > 0) {
            await queryRunner.manager.save(MaterialHistory, {
              materialId: savedMaterial.id,
              process,
              type: MaterialHistoryType.IMPORT,
              previousStock: 0,
              currentStock: savedMaterial.stock,
            });
          }

          created++;
        }
      }

      await queryRunner.commitTransaction();
      return { created, updated };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * origin 문자열을 MaterialOrigin enum으로 변환
   */
  private parseOrigin(origin?: string): MaterialOrigin {
    if (!origin) return MaterialOrigin.DOMESTIC;
    if (origin === '해외' || origin.toLowerCase() === 'overseas') {
      return MaterialOrigin.OVERSEAS;
    }
    return MaterialOrigin.DOMESTIC;
  }

  /**
   * purpose 문자열을 MaterialPurpose enum으로 변환
   */
  private parsePurpose(purpose?: string): MaterialPurpose {
    if (!purpose) return MaterialPurpose.PRODUCTION;
    if (purpose === '개발' || purpose.toLowerCase() === 'development') {
      return MaterialPurpose.DEVELOPMENT;
    }
    if (purpose === '불용' || purpose.toLowerCase() === 'unused') {
      return MaterialPurpose.UNUSED;
    }
    return MaterialPurpose.PRODUCTION;
  }
}
