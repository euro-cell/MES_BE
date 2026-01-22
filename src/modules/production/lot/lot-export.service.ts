import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import JSZip from 'jszip';
import * as path from 'path';
import * as fs from 'fs';
import { MixingService } from './electrode/mixing.service';

@Injectable()
export class LotExportService {
  private readonly templatePath = path.join(process.cwd(), 'data', 'templates', 'lot');

  constructor(private readonly mixingService: MixingService) {}

  async exportLots(productionId: number): Promise<StreamableFile> {
    // 템플릿 파일 로드
    const templateFilePath = path.join(this.templatePath, 'manage.xlsx');

    if (!fs.existsSync(templateFilePath)) {
      throw new NotFoundException(`템플릿 파일을 찾을 수 없습니다: manage.xlsx`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templateFilePath);

    // Mixing 시트에 데이터 채우기
    await this.fillMixingSheet(workbook, productionId);

    const buffer = await workbook.xlsx.writeBuffer();

    // 명명된 범위(definedNames) 제거하여 Excel 경고 방지
    const cleanedBuffer = await this.removeDefinedNames(Buffer.from(buffer));
    return new StreamableFile(cleanedBuffer);
  }

  /**
   * workbook.xml에서 definedNames 섹션 제거
   */
  private async removeDefinedNames(buffer: Buffer): Promise<Buffer> {
    const zip = await JSZip.loadAsync(buffer);
    const workbookXml = await zip.file('xl/workbook.xml')?.async('string');

    if (workbookXml) {
      // definedNames 섹션 제거
      const cleanedXml = workbookXml.replace(/<definedNames>[\s\S]*?<\/definedNames>/g, '');
      zip.file('xl/workbook.xml', cleanedXml);
    }

    return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
  }

  private async fillMixingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    // Mixing 시트 찾기 (이름 또는 첫 번째 시트)
    const worksheet = workbook.getWorksheet('Mixing') || workbook.worksheets[0];

    if (!worksheet) {
      throw new NotFoundException('Mixing 시트를 찾을 수 없습니다.');
    }

    // 데이터 조회
    const mixingLots = await this.mixingService.getMixingLots(productionId);

    // 6행부터 데이터 입력
    let rowIndex = 6;
    for (const lot of mixingLots) {
      // tempHumi 파싱: "25°C / 50%" → temp: "25", humidity: "50"
      const { temp, humidity } = this.parseTempHumi(lot.slurry?.tempHumi);

      // 값이 있는 경우에만 셀에 입력
      if (lot.processDate) {
        worksheet.getCell(rowIndex, 2).value = this.formatDate(lot.processDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(rowIndex, 3).value = lot.lot; // C: Lot
      }
      if (temp) {
        worksheet.getCell(rowIndex, 4).value = Number(temp); // D: Temp
      }
      if (humidity) {
        worksheet.getCell(rowIndex, 5).value = Number(humidity); // E: Humidity
      }
      if (lot.slurry?.activeMaterialInput != null) {
        worksheet.getCell(rowIndex, 6).value = lot.slurry.activeMaterialInput; // F: Active Material
      }
      if (lot.slurry?.viscosityAfterMixing != null) {
        worksheet.getCell(rowIndex, 7).value = lot.slurry.viscosityAfterMixing; // G: After Mixing
      }
      if (lot.slurry?.viscosityAfterDefoaming != null) {
        worksheet.getCell(rowIndex, 8).value = lot.slurry.viscosityAfterDefoaming; // H: 탈포 후
      }
      if (lot.slurry?.viscosityAfterStabilization != null) {
        worksheet.getCell(rowIndex, 9).value = lot.slurry.viscosityAfterStabilization; // I: 안정화 후
      }
      if (lot.slurry?.grindGage != null) {
        worksheet.getCell(rowIndex, 10).value = lot.slurry.grindGage; // J: Grind Gage
      }
      if (lot.slurry?.solidContent1 != null) {
        worksheet.getCell(rowIndex, 11).value = lot.slurry.solidContent1; // K: solid content 1
      }
      if (lot.slurry?.solidContent2 != null) {
        worksheet.getCell(rowIndex, 12).value = lot.slurry.solidContent2; // L: solid content 2
      }
      if (lot.slurry?.solidContent3 != null) {
        worksheet.getCell(rowIndex, 13).value = lot.slurry.solidContent3; // M: solid content 3
      }
      if (lot.binder?.viscosity != null) {
        worksheet.getCell(rowIndex, 14).value = lot.binder.viscosity; // N: Binder viscosity
      }
      if (lot.binder?.solidContent1 != null) {
        worksheet.getCell(rowIndex, 15).value = lot.binder.solidContent1; // O: Binder solid 1
      }
      if (lot.binder?.solidContent2 != null) {
        worksheet.getCell(rowIndex, 16).value = lot.binder.solidContent2; // P: Binder solid 2
      }
      if (lot.binder?.solidContent3 != null) {
        worksheet.getCell(rowIndex, 17).value = lot.binder.solidContent3; // Q: Binder solid 3
      }

      rowIndex++;
    }
  }

  /**
   * tempHumi 필드 파싱
   * "25°C / 50%" → { temp: "25", humidity: "50" }
   */
  private parseTempHumi(tempHumi: string | null | undefined): { temp: string; humidity: string } {
    if (!tempHumi) {
      return { temp: '', humidity: '' };
    }

    // "25°C / 50%" 또는 "25 / 50" 형식 처리
    const parts = tempHumi.split('/').map((s) => s.trim());
    if (parts.length !== 2) {
      return { temp: '', humidity: '' };
    }

    // 숫자만 추출
    const tempMatch = parts[0].match(/[\d.]+/);
    const humidityMatch = parts[1].match(/[\d.]+/);

    return {
      temp: tempMatch ? tempMatch[0] : '',
      humidity: humidityMatch ? humidityMatch[0] : '',
    };
  }

  /**
   * 날짜 포맷: YYYY-MM-DD
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
