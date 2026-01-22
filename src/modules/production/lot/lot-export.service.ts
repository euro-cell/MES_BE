import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import JSZip from 'jszip';
import * as path from 'path';
import * as fs from 'fs';
import { MixingService } from './electrode/mixing.service';
import { CoatingService } from './electrode/coating.service';
import { PressService } from './electrode/press.service';
import { NotchingService } from './electrode/notching.service';
import { StackingService } from './assembly/stacking.service';
import { WeldingService } from './assembly/welding.service';
import { SealingLotService } from './assembly/sealing.service';
import { FormationLotService } from './formation/formation.service';

@Injectable()
export class LotExportService {
  private readonly templatePath = path.join(process.cwd(), 'data', 'templates', 'lot');

  constructor(
    private readonly mixingService: MixingService,
    private readonly coatingService: CoatingService,
    private readonly pressService: PressService,
    private readonly notchingService: NotchingService,
    private readonly stackingService: StackingService,
    private readonly weldingService: WeldingService,
    private readonly sealingLotService: SealingLotService,
    private readonly formationLotService: FormationLotService,
  ) {}

  async exportLots(productionId: number): Promise<StreamableFile> {
    // 템플릿 파일 로드
    const templateFilePath = path.join(this.templatePath, 'manage.xlsx');

    if (!fs.existsSync(templateFilePath)) {
      throw new NotFoundException(`템플릿 파일을 찾을 수 없습니다: manage.xlsx`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templateFilePath);

    // 각 시트에 데이터 채우기
    await this.fillMixingSheet(workbook, productionId);
    await this.fillCoatingSheet(workbook, productionId);
    await this.fillCalenderingSheet(workbook, productionId);
    await this.fillNotchingSheet(workbook, productionId);
    await this.fillStackingSheet(workbook, productionId);
    await this.fillWeldingSheet(workbook, productionId);
    await this.fillSealingSheet(workbook, productionId);
    await this.fillFormationSheet(workbook, productionId);

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

  private async fillCoatingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Coating');

    if (!worksheet) {
      return; // Coating 시트가 없으면 건너뜀
    }

    const coatingLots = await this.coatingService.getCoatingLots(productionId);

    // 6행부터 데이터 입력 (한 Lot당 2행 사용: Start/End)
    let rowIndex = 6;
    for (const lot of coatingLots) {
      const startRow = rowIndex;
      const endRow = rowIndex + 1;

      // 2행 병합 컬럼들 (첫 번째 행에만 입력)
      if (lot.coatingDate) {
        worksheet.getCell(startRow, 2).value = this.formatDate(lot.coatingDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(startRow, 3).value = lot.lot; // C: Lot
      }
      if (lot.atCoating?.temp != null) {
        worksheet.getCell(startRow, 4).value = lot.atCoating.temp; // D: Temp
      }
      if (lot.atCoating?.humidity != null) {
        worksheet.getCell(startRow, 5).value = lot.atCoating.humidity; // E: Humidity
      }
      if (lot.electrodeSpec?.coatLength != null) {
        worksheet.getCell(startRow, 6).value = lot.electrodeSpec.coatLength; // F: Coat Length
      }
      if (lot.electrodeSpec?.coatingWidth != null) {
        worksheet.getCell(startRow, 7).value = lot.electrodeSpec.coatingWidth; // G: Coating Width
      }
      if (lot.electrodeSpec?.loadingWeight != null) {
        worksheet.getCell(startRow, 8).value = lot.electrodeSpec.loadingWeight; // H: Loading Weight
      }

      // I열: Start/End 라벨
      worksheet.getCell(startRow, 9).value = 'Start';
      worksheet.getCell(endRow, 9).value = 'End';

      // A-Side Coat Weight (J-N) - I열 건너뜀
      if (lot.inspection?.aSideCoatWeight) {
        const asCW = lot.inspection.aSideCoatWeight;
        if (asCW.op?.start != null) worksheet.getCell(startRow, 10).value = asCW.op.start; // J: OP start
        if (asCW.op?.end != null) worksheet.getCell(endRow, 10).value = asCW.op.end; // J: OP end
        if (asCW.mid?.start != null) worksheet.getCell(startRow, 11).value = asCW.mid.start; // K: Mid start
        if (asCW.mid?.end != null) worksheet.getCell(endRow, 11).value = asCW.mid.end; // K: Mid end
        if (asCW.gear?.start != null) worksheet.getCell(startRow, 12).value = asCW.gear.start; // L: Gear start
        if (asCW.gear?.end != null) worksheet.getCell(endRow, 12).value = asCW.gear.end; // L: Gear end
        if (asCW.webSpeed != null) worksheet.getCell(startRow, 13).value = asCW.webSpeed; // M: Web Speed (merged)
        if (asCW.pump?.start != null) worksheet.getCell(startRow, 14).value = asCW.pump.start; // N: Pump start
        if (asCW.pump?.end != null) worksheet.getCell(endRow, 14).value = asCW.pump.end; // N: Pump end
      }

      // O열: Start/End 라벨
      worksheet.getCell(startRow, 15).value = 'Start';
      worksheet.getCell(endRow, 15).value = 'End';

      // Both Coat Weight (P-T) - O열 건너뜀
      if (lot.inspection?.bothCoatWeight) {
        const bCW = lot.inspection.bothCoatWeight;
        if (bCW.op?.start != null) worksheet.getCell(startRow, 16).value = bCW.op.start; // P: OP start
        if (bCW.op?.end != null) worksheet.getCell(endRow, 16).value = bCW.op.end; // P: OP end
        if (bCW.mid?.start != null) worksheet.getCell(startRow, 17).value = bCW.mid.start; // Q: Mid start
        if (bCW.mid?.end != null) worksheet.getCell(endRow, 17).value = bCW.mid.end; // Q: Mid end
        if (bCW.gear?.start != null) worksheet.getCell(startRow, 18).value = bCW.gear.start; // R: Gear start
        if (bCW.gear?.end != null) worksheet.getCell(endRow, 18).value = bCW.gear.end; // R: Gear end
        if (bCW.webSpeed != null) worksheet.getCell(startRow, 19).value = bCW.webSpeed; // S: Web Speed (merged)
        if (bCW.pump != null) worksheet.getCell(startRow, 20).value = bCW.pump; // T: Pump (merged)
      }

      // Both Coat Thickness (U-W)
      if (lot.inspection?.bothCoatThickness) {
        const bCT = lot.inspection.bothCoatThickness;
        if (bCT.op?.start != null) worksheet.getCell(startRow, 21).value = bCT.op.start; // U: OP start
        if (bCT.op?.end != null) worksheet.getCell(endRow, 21).value = bCT.op.end; // U: OP end
        if (bCT.mid?.start != null) worksheet.getCell(startRow, 22).value = bCT.mid.start; // V: Mid start
        if (bCT.mid?.end != null) worksheet.getCell(endRow, 22).value = bCT.mid.end; // V: Mid end
        if (bCT.gear?.start != null) worksheet.getCell(startRow, 23).value = bCT.gear.start; // W: Gear start
        if (bCT.gear?.end != null) worksheet.getCell(endRow, 23).value = bCT.gear.end; // W: Gear end
      }

      // Misalignment (X)
      if (lot.inspection?.misalignment != null) {
        worksheet.getCell(startRow, 24).value = lot.inspection.misalignment; // X: Misalignment (merged)
      }

      // Drying Conditions - Temperature (Y-AB)
      if (lot.dryingCondition?.temperature) {
        const temp = lot.dryingCondition.temperature;
        if (temp.zone1?.start != null) worksheet.getCell(startRow, 25).value = temp.zone1.start; // Y: Zone1 start
        if (temp.zone1?.end != null) worksheet.getCell(endRow, 25).value = temp.zone1.end; // Y: Zone1 end
        if (temp.zone2?.start != null) worksheet.getCell(startRow, 26).value = temp.zone2.start; // Z: Zone2 start
        if (temp.zone2?.end != null) worksheet.getCell(endRow, 26).value = temp.zone2.end; // Z: Zone2 end
        if (temp.zone3 != null) worksheet.getCell(startRow, 27).value = temp.zone3; // AA: Zone3 (merged)
        if (temp.zone4 != null) worksheet.getCell(startRow, 28).value = temp.zone4; // AB: Zone4 (merged)
      }

      // Drying Conditions - Supply (AC-AF)
      if (lot.dryingCondition?.supply) {
        const supply = lot.dryingCondition.supply;
        if (supply.zone1?.start != null) worksheet.getCell(startRow, 29).value = supply.zone1.start; // AC: Zone1 start
        if (supply.zone1?.end != null) worksheet.getCell(endRow, 29).value = supply.zone1.end; // AC: Zone1 end
        if (supply.zone2?.start != null) worksheet.getCell(startRow, 30).value = supply.zone2.start; // AD: Zone2 start
        if (supply.zone2?.end != null) worksheet.getCell(endRow, 30).value = supply.zone2.end; // AD: Zone2 end
        if (supply.zone3 != null) worksheet.getCell(startRow, 31).value = supply.zone3; // AE: Zone3 (merged)
        if (supply.zone4 != null) worksheet.getCell(startRow, 32).value = supply.zone4; // AF: Zone4 (merged)
      }

      // Drying Conditions - Exhaust (AG-AH)
      if (lot.dryingCondition?.exhaust) {
        const exhaust = lot.dryingCondition.exhaust;
        if (exhaust.zone2 != null) worksheet.getCell(startRow, 33).value = exhaust.zone2; // AG: Zone2 (merged)
        if (exhaust.zone4 != null) worksheet.getCell(startRow, 34).value = exhaust.zone4; // AH: Zone4 (merged)
      }

      // Slurry Info (AI-AK)
      if (lot.slurryInfo) {
        if (lot.slurryInfo.lot) worksheet.getCell(startRow, 35).value = lot.slurryInfo.lot; // AI: Lot (merged)
        if (lot.slurryInfo.viscosity != null) worksheet.getCell(startRow, 36).value = lot.slurryInfo.viscosity; // AJ: Viscosity (merged)
        if (lot.slurryInfo.solidContent != null) worksheet.getCell(startRow, 37).value = lot.slurryInfo.solidContent; // AK: Solid Content (merged)
      }

      // Foil Info (AL-AP)
      if (lot.foilInfo) {
        if (lot.foilInfo.lot) worksheet.getCell(startRow, 38).value = lot.foilInfo.lot; // AL: Lot (merged)
        if (lot.foilInfo.type) worksheet.getCell(startRow, 39).value = lot.foilInfo.type; // AM: Type (merged)
        if (lot.foilInfo.length != null) worksheet.getCell(startRow, 40).value = lot.foilInfo.length; // AN: Length (merged)
        if (lot.foilInfo.width != null) worksheet.getCell(startRow, 41).value = lot.foilInfo.width; // AO: Width (merged)
        if (lot.foilInfo.thickness != null) worksheet.getCell(startRow, 42).value = lot.foilInfo.thickness; // AP: Thickness (merged)
      }

      // 2행 병합 (값이 동일한 컬럼들)
      const mergeColumns = [
        2, 3, 4, 5, 6, 7, 8, // B-H: Date, Lot, Temp, Humidity, Electrode Spec
        13, // M: Web Speed
        19, 20, // S-T: Web Speed, Pump
        24, // X: Misalignment
        27, 28, // AA-AB: Zone3, Zone4
        31, 32, // AE-AF: Zone3, Zone4
        33, 34, // AG-AH: Exhaust
        35, 36, 37, // AI-AK: Slurry Info
        38, 39, 40, 41, 42, 43, // AL-AQ: Foil Info + AQ
      ];
      for (const col of mergeColumns) {
        try {
          worksheet.mergeCells(startRow, col, endRow, col);
        } catch {
          // 이미 병합된 셀은 건너뜀
        }
      }

      rowIndex += 2; // 다음 Lot은 2행 뒤부터
    }
  }

  private async fillCalenderingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Calendering');

    if (!worksheet) {
      return; // Calendering 시트가 없으면 건너뜀
    }

    const pressLots = await this.pressService.getPressLots(productionId);

    // 6행부터 데이터 입력 (한 Lot당 2행 사용: Start/End)
    let rowIndex = 6;
    for (const lot of pressLots) {
      const startRow = rowIndex;
      const endRow = rowIndex + 1;

      // 2행 병합 컬럼들 (첫 번째 행에만 입력)
      if (lot.calenderingDate) {
        worksheet.getCell(startRow, 2).value = this.formatDate(lot.calenderingDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(startRow, 3).value = lot.lot; // C: Lot
      }
      if (lot.atCalendering?.temp != null) {
        worksheet.getCell(startRow, 4).value = lot.atCalendering.temp; // D: Temp
      }
      if (lot.atCalendering?.humidity != null) {
        worksheet.getCell(startRow, 5).value = lot.atCalendering.humidity; // E: Humidity
      }
      if (lot.calenderingLen != null) {
        worksheet.getCell(startRow, 6).value = lot.calenderingLen; // F: Calendering Length
      }
      if (lot.electrodeSpec?.pressingThick != null) {
        worksheet.getCell(startRow, 7).value = lot.electrodeSpec.pressingThick; // G: Pressing Thick
      }
      if (lot.electrodeSpec?.loadingWeight != null) {
        worksheet.getCell(startRow, 8).value = lot.electrodeSpec.loadingWeight; // H: Loading Weight
      }
      if (lot.realInspection?.conditions) {
        worksheet.getCell(startRow, 9).value = lot.realInspection.conditions; // I: Conditions
      }
      if (lot.realInspection?.pressingTemp != null) {
        worksheet.getCell(startRow, 10).value = lot.realInspection.pressingTemp; // J: Pressing Temp
      }

      // K열: Start/End 라벨
      worksheet.getCell(startRow, 11).value = 'Start';
      worksheet.getCell(endRow, 11).value = 'End';

      // Thickness (L-N) - K열 건너뜀, start/end 분리
      if (lot.realInspection?.thickness) {
        const thickness = lot.realInspection.thickness;
        if (thickness.op?.start != null) worksheet.getCell(startRow, 12).value = thickness.op.start; // L: OP start
        if (thickness.op?.end != null) worksheet.getCell(endRow, 12).value = thickness.op.end; // L: OP end
        if (thickness.mid?.start != null) worksheet.getCell(startRow, 13).value = thickness.mid.start; // M: Mid start
        if (thickness.mid?.end != null) worksheet.getCell(endRow, 13).value = thickness.mid.end; // M: Mid end
        if (thickness.gear?.start != null) worksheet.getCell(startRow, 14).value = thickness.gear.start; // N: Gear start
        if (thickness.gear?.end != null) worksheet.getCell(endRow, 14).value = thickness.gear.end; // N: Gear end
      }

      // Coat Weight (O-R) - 병합
      if (lot.realInspection?.coatWeight) {
        const coatWeight = lot.realInspection.coatWeight;
        if (coatWeight.spec != null) worksheet.getCell(startRow, 15).value = coatWeight.spec; // O: Spec
        if (coatWeight.p1 != null) worksheet.getCell(startRow, 16).value = coatWeight.p1; // P: P1
        if (coatWeight.p3 != null) worksheet.getCell(startRow, 17).value = coatWeight.p3; // Q: P3
        if (coatWeight.p4 != null) worksheet.getCell(startRow, 18).value = coatWeight.p4; // R: P4
      }

      // 2행 병합 (값이 동일한 컬럼들)
      const mergeColumns = [
        2, 3, 4, 5, 6, 7, 8, 9, 10, // B-J: Date ~ Pressing Temp
        15, 16, 17, 18, // O-R: Coat Weight
      ];
      for (const col of mergeColumns) {
        try {
          worksheet.mergeCells(startRow, col, endRow, col);
        } catch {
          // 이미 병합된 셀은 건너뜀
        }
      }

      rowIndex += 2; // 다음 Lot은 2행 뒤부터
    }
  }

  private async fillNotchingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Notching');

    if (!worksheet) {
      return; // Notching 시트가 없으면 건너뜀
    }

    const notchingLots = await this.notchingService.getNotchingLots(productionId);

    // 디버그: Notching 데이터 출력
    console.log('=== Notching Data Debug ===');
    console.log('Total Lots:', notchingLots.length);
    notchingLots.forEach((lot, index) => {
      console.log(`\n[Lot ${index + 1}]`);
      console.log('  B (Date):', lot.notchingDate);
      console.log('  C (Lot):', lot.lot);
      console.log('  D (Temp):', lot.atNotching?.temp);
      console.log('  E (Humidity):', lot.atNotching?.humidity);
      console.log('  F (Over Tab):', lot.electrodeSpec?.overTab);
      console.log('  G (Wide):', lot.electrodeSpec?.wide);
      console.log('  H (Length):', lot.electrodeSpec?.length);
      console.log('  I (Miss Match):', lot.electrodeSpec?.missMatch);
      console.log('  J (Total Output):', lot.production?.totalOutput);
      console.log('  K (Defective):', lot.production?.defective);
      console.log('  L (Quantity):', lot.production?.quantity);
      console.log('  M (Fraction Defective):', lot.production?.fractionDefective);
    });
    console.log('=== End Notching Debug ===\n');

    // 6행부터 데이터 입력 (한 Lot당 1행 사용)
    let rowIndex = 6;
    for (const lot of notchingLots) {
      if (lot.notchingDate) {
        worksheet.getCell(rowIndex, 2).value = this.formatDate(lot.notchingDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(rowIndex, 3).value = lot.lot; // C: Lot
      }
      if (lot.atNotching?.temp != null) {
        worksheet.getCell(rowIndex, 4).value = lot.atNotching.temp; // D: Temp
      }
      if (lot.atNotching?.humidity != null) {
        worksheet.getCell(rowIndex, 5).value = lot.atNotching.humidity; // E: Humidity
      }
      if (lot.electrodeSpec?.overTab != null) {
        worksheet.getCell(rowIndex, 6).value = lot.electrodeSpec.overTab; // F: Over Tab
      }
      if (lot.electrodeSpec?.wide != null) {
        worksheet.getCell(rowIndex, 7).value = lot.electrodeSpec.wide; // G: Wide
      }
      if (lot.electrodeSpec?.length != null) {
        worksheet.getCell(rowIndex, 8).value = lot.electrodeSpec.length; // H: Length
      }
      if (lot.electrodeSpec?.missMatch != null) {
        worksheet.getCell(rowIndex, 9).value = lot.electrodeSpec.missMatch; // I: Miss Match
      }
      if (lot.production?.totalOutput != null) {
        worksheet.getCell(rowIndex, 10).value = lot.production.totalOutput; // J: Total Output
      }
      if (lot.production?.defective != null) {
        worksheet.getCell(rowIndex, 11).value = lot.production.defective; // K: Defective
      }
      if (lot.production?.quantity != null) {
        worksheet.getCell(rowIndex, 12).value = lot.production.quantity; // L: Quantity
      }
      if (lot.production?.fractionDefective != null) {
        worksheet.getCell(rowIndex, 13).value = lot.production.fractionDefective / 100; // M: Fraction defective (퍼센트 서식용)
      }

      rowIndex++;
    }
  }

  private async fillStackingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Stacking');

    if (!worksheet) {
      return; // Stacking 시트가 없으면 건너뜀
    }

    const stackingLots = await this.stackingService.getStackingLots(productionId);

    // 6행부터 데이터 입력 (한 Lot당 2행 사용)
    let rowIndex = 6;
    for (const lot of stackingLots) {
      const startRow = rowIndex;
      const endRow = rowIndex + 1;

      // 행 높이 설정
      worksheet.getRow(startRow).height = 10;
      worksheet.getRow(endRow).height = 10;

      // 2행 병합 컬럼들 (첫 번째 행에만 입력)
      if (lot.productionDate) {
        worksheet.getCell(startRow, 2).value = this.formatDate(lot.productionDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(startRow, 3).value = lot.lot; // C: Lot
      }
      if (lot.atStacking?.temp != null) {
        worksheet.getCell(startRow, 4).value = lot.atStacking.temp; // D: Temp
      }
      if (lot.atStacking?.humidity != null) {
        worksheet.getCell(startRow, 5).value = lot.atStacking.humidity; // E: Humidity
      }
      if (lot.jellyrollSpec?.stack != null) {
        worksheet.getCell(startRow, 6).value = lot.jellyrollSpec.stack; // F: Stack
      }
      if (lot.jellyrollSpec?.weight != null) {
        worksheet.getCell(startRow, 7).value = lot.jellyrollSpec.weight; // G: Weight
      }
      if (lot.jellyrollSpec?.thickness != null) {
        worksheet.getCell(startRow, 8).value = lot.jellyrollSpec.thickness; // H: Thickness
      }
      if (lot.jellyrollSpec?.alignment != null) {
        worksheet.getCell(startRow, 9).value = lot.jellyrollSpec.alignment; // I: Alignment
      }
      if (lot.jellyrollSpec?.ir != null) {
        worksheet.getCell(startRow, 10).value = lot.jellyrollSpec.ir; // J: IR
      }

      // K열: Notching 양극 (row1/row2 분리, 병합 안함)
      if (lot.magazine?.notchingAnode?.row1 != null) {
        worksheet.getCell(startRow, 11).value = lot.magazine.notchingAnode.row1; // K: row1
      }
      if (lot.magazine?.notchingAnode?.row2 != null) {
        worksheet.getCell(endRow, 11).value = lot.magazine.notchingAnode.row2; // K: row2
      }

      // L열: Notching 음극 (row1/row2 분리, 병합 안함)
      if (lot.magazine?.notchingCathode?.row1 != null) {
        worksheet.getCell(startRow, 12).value = lot.magazine.notchingCathode.row1; // L: row1
      }
      if (lot.magazine?.notchingCathode?.row2 != null) {
        worksheet.getCell(endRow, 12).value = lot.magazine.notchingCathode.row2; // L: row2
      }

      // M열: Separate (병합)
      if (lot.magazine?.separate != null) {
        worksheet.getCell(startRow, 13).value = lot.magazine.separate; // M: Separate
      }

      // 2행 병합 (K, L 제외)
      const mergeColumns = [
        2, 3, 4, 5, 6, 7, 8, 9, 10, // B-J
        13, // M: Separate
      ];
      for (const col of mergeColumns) {
        try {
          worksheet.mergeCells(startRow, col, endRow, col);
        } catch {
          // 이미 병합된 셀은 건너뜀
        }
      }

      // 불량인 경우 빨간 배경색 적용
      if (lot.isDefective) {
        const redFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
        for (let col = 2; col <= 13; col++) {
          worksheet.getCell(startRow, col).fill = redFill;
          worksheet.getCell(endRow, col).fill = redFill;
        }
      }

      rowIndex += 2; // 다음 Lot은 2행 뒤부터
    }
  }

  private async fillWeldingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Welding');

    if (!worksheet) {
      return; // Welding 시트가 없으면 건너뜀
    }

    const weldingLots = await this.weldingService.getWeldingLots(productionId);

    // 6행부터 데이터 입력 (한 Lot당 1행 사용)
    let rowIndex = 6;
    for (const lot of weldingLots) {
      if (lot.weldingDate) {
        worksheet.getCell(rowIndex, 2).value = this.formatDate(lot.weldingDate); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(rowIndex, 3).value = lot.lot; // C: Lot
      }
      if (lot.atWelding?.temp != null) {
        worksheet.getCell(rowIndex, 4).value = lot.atWelding.temp; // D: Temp
      }
      if (lot.atWelding?.humidity != null) {
        worksheet.getCell(rowIndex, 5).value = lot.atWelding.humidity; // E: Humidity
      }
      if (lot.preWelding?.weldingPosition != null) {
        worksheet.getCell(rowIndex, 6).value = lot.preWelding.weldingPosition; // F: Pre Welding Position
      }
      if (lot.preWelding?.trimPosition != null) {
        worksheet.getCell(rowIndex, 7).value = lot.preWelding.trimPosition; // G: Trim Position
      }
      if (lot.mainWelding?.weldingPosition != null) {
        worksheet.getCell(rowIndex, 8).value = lot.mainWelding.weldingPosition; // H: Main Welding Position
      }
      if (lot.mainWelding?.irCheck != null) {
        worksheet.getCell(rowIndex, 9).value = lot.mainWelding.irCheck; // I: IR Check
      }
      if (lot.mainWelding?.taping != null) {
        worksheet.getCell(rowIndex, 10).value = lot.mainWelding.taping; // J: Taping
      }

      // 불량 색상 적용 (스태킹 불량: 빨강, 웰딩 불량: 주황)
      if (lot.isDefectiveFromStacking) {
        const redFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
        for (let col = 2; col <= 10; col++) {
          worksheet.getCell(rowIndex, col).fill = redFill;
        }
      } else if (lot.isDefectiveFromWelding) {
        const orangeFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' },
        };
        for (let col = 2; col <= 10; col++) {
          worksheet.getCell(rowIndex, col).fill = orangeFill;
        }
      }

      rowIndex++;
    }
  }

  private async fillSealingSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Sealing_Filling');

    if (!worksheet) {
      return; // Sealing_Filling 시트가 없으면 건너뜀
    }

    const sealingLots = await this.sealingLotService.getSealingLots(productionId);

    // 6행부터 데이터 입력 (한 Lot당 1행 사용)
    let rowIndex = 6;
    for (const lot of sealingLots) {
      if (lot.date) {
        worksheet.getCell(rowIndex, 2).value = this.formatDate(lot.date); // B: Date
      }
      if (lot.lot) {
        worksheet.getCell(rowIndex, 3).value = lot.lot; // C: Lot
      }
      if (lot.atAssy?.temp != null) {
        worksheet.getCell(rowIndex, 4).value = lot.atAssy.temp; // D: Temp
      }
      if (lot.atAssy?.humidity != null) {
        worksheet.getCell(rowIndex, 5).value = lot.atAssy.humidity; // E: Humidity
      }
      if (lot.topSealing?.sealantHeight != null) {
        worksheet.getCell(rowIndex, 6).value = lot.topSealing.sealantHeight; // F: Sealant Height
      }
      if (lot.topSealing?.pouchSealingThickness != null) {
        worksheet.getCell(rowIndex, 7).value = lot.topSealing.pouchSealingThickness; // G: Pouch Sealing Thickness
      }
      if (lot.topSealing?.tabSealingThickness != null) {
        worksheet.getCell(rowIndex, 8).value = lot.topSealing.tabSealingThickness; // H: Tab Sealing Thickness
      }
      if (lot.topSealing?.visualInspection != null) {
        worksheet.getCell(rowIndex, 9).value = lot.topSealing.visualInspection; // I: Visual Inspection
      }
      if (lot.sideSealing?.pouchSealingThickness != null) {
        worksheet.getCell(rowIndex, 10).value = lot.sideSealing.pouchSealingThickness; // J: Pouch Sealing Thickness
      }
      if (lot.sideSealing?.sideBottomSealingWidth != null) {
        worksheet.getCell(rowIndex, 11).value = lot.sideSealing.sideBottomSealingWidth; // K: Side/Bottom Sealing Width
      }
      if (lot.sideSealing?.visualInspection != null) {
        worksheet.getCell(rowIndex, 12).value = lot.sideSealing.visualInspection; // L: Visual Inspection
      }
      if (lot.sideSealing?.irCheck != null) {
        worksheet.getCell(rowIndex, 13).value = lot.sideSealing.irCheck; // M: IR Check
      }
      if (lot.filling?.injection != null) {
        worksheet.getCell(rowIndex, 14).value = this.formatDate(lot.filling.injection); // N: Filling Injection
      }
      if (lot.filling?.lot != null) {
        worksheet.getCell(rowIndex, 15).value = lot.filling.lot; // O: Filling LOT
      }
      if (lot.pouch?.lot != null) {
        worksheet.getCell(rowIndex, 16).value = lot.pouch.lot; // P: Pouch LOT
      }

      // 불량 색상 적용 (스태킹 불량: 빨강, 웰딩 불량: 주황, 실링 불량: 연녹색)
      if (lot.isDefectiveFromStacking) {
        const redFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
        for (let col = 2; col <= 16; col++) {
          worksheet.getCell(rowIndex, col).fill = redFill;
        }
      } else if (lot.isDefectiveFromWelding) {
        const orangeFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' },
        };
        for (let col = 2; col <= 16; col++) {
          worksheet.getCell(rowIndex, col).fill = orangeFill;
        }
      } else if (lot.isDefectiveFromSealing) {
        const lightGreenFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' },
        };
        for (let col = 2; col <= 16; col++) {
          worksheet.getCell(rowIndex, col).fill = lightGreenFill;
        }
      } else {
        // 불량이 아닌 경우 템플릿 기본 배경색 제거
        const noFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'none',
        };
        for (let col = 2; col <= 16; col++) {
          worksheet.getCell(rowIndex, col).fill = noFill;
        }
      }

      rowIndex++;
    }

    // B열 기본 스타일 제거 (템플릿 빨간 배경색 제거)
    const noFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'none',
    };
    for (let col = 2; col <= 16; col++) {
      const column = worksheet.getColumn(col);
      column.style = { ...column.style, fill: noFill };
    }
  }

  private async fillFormationSheet(workbook: ExcelJS.Workbook, productionId: number): Promise<void> {
    const worksheet = workbook.getWorksheet('Formation');

    if (!worksheet) {
      return; // Formation 시트가 없으면 건너뜀
    }

    const formationLots = await this.formationLotService.getFormationLots(productionId);

    // Boolean → P/NP 변환 함수
    const boolToPNP = (value: boolean | null | undefined): string | null => {
      if (value === null || value === undefined) return null;
      return value ? 'P' : 'NP';
    };

    // 6행부터 데이터 입력 (한 Lot당 1행 사용)
    let rowIndex = 6;
    for (const lot of formationLots) {
      // B: Date
      if (lot.date) {
        worksheet.getCell(rowIndex, 2).value = this.formatDate(lot.date);
      }
      // C: Assy Lot
      if (lot.assyLot) {
        worksheet.getCell(rowIndex, 3).value = lot.assyLot;
      }
      // D: Lot
      if (lot.lot) {
        worksheet.getCell(rowIndex, 4).value = lot.lot;
      }
      // E: Pre-Formation Equipment
      if (lot.preFormation?.equipment) {
        worksheet.getCell(rowIndex, 5).value = lot.preFormation.equipment;
      }
      // F: Pre-Formation CH No.
      if (lot.preFormation?.chNo) {
        worksheet.getCell(rowIndex, 6).value = lot.preFormation.chNo;
      }
      // G: Pre-Formation PFC
      if (lot.preFormation?.pfc != null) {
        worksheet.getCell(rowIndex, 7).value = lot.preFormation.pfc;
      }
      // H: Pre-Formation RFD
      if (lot.preFormation?.rfd != null) {
        worksheet.getCell(rowIndex, 8).value = lot.preFormation.rfd;
      }
      // I: Pre-Formation For.Eff_1
      if (lot.preFormation?.forEff1 != null) {
        worksheet.getCell(rowIndex, 9).value = lot.preFormation.forEff1;
      }
      // J: Final Sealing Pouch Sealing Thickness
      if (lot.finalSealing?.pouchSealingThickness != null) {
        worksheet.getCell(rowIndex, 10).value = lot.finalSealing.pouchSealingThickness;
      }
      // K: Final Sealing Side/Bottom Sealing Width (boolean → P/NP)
      const sideBottomValue = boolToPNP(lot.finalSealing?.sideBottomSealingWidth);
      if (sideBottomValue) {
        worksheet.getCell(rowIndex, 11).value = sideBottomValue;
      }
      // L: Final Sealing Visual Inspection (boolean → P/NP)
      const visualValue = boolToPNP(lot.finalSealing?.visualInspection);
      if (visualValue) {
        worksheet.getCell(rowIndex, 12).value = visualValue;
      }
      // M: Main Formation Equipment
      if (lot.mainFormation?.equipment) {
        worksheet.getCell(rowIndex, 13).value = lot.mainFormation.equipment;
      }
      // N: Main Formation CH No.
      if (lot.mainFormation?.chNo) {
        worksheet.getCell(rowIndex, 14).value = lot.mainFormation.chNo;
      }
      // O: Main Formation MFC
      if (lot.mainFormation?.mfc != null) {
        worksheet.getCell(rowIndex, 15).value = lot.mainFormation.mfc;
      }
      // P: OCV1
      if (lot.ocvIr1?.ocv1 != null) {
        worksheet.getCell(rowIndex, 16).value = lot.ocvIr1.ocv1;
      }
      // Q: IR1
      if (lot.ocvIr1?.ir1 != null) {
        worksheet.getCell(rowIndex, 17).value = lot.ocvIr1.ir1;
      }
      // R: OCV2-4
      if (lot.aging4Days?.ocv2_4 != null) {
        worksheet.getCell(rowIndex, 18).value = lot.aging4Days.ocv2_4;
      }
      // S: IR2-4
      if (lot.aging4Days?.ir2_4 != null) {
        worksheet.getCell(rowIndex, 19).value = lot.aging4Days.ir2_4;
      }
      // T: OCV2-7
      if (lot.aging7Days?.ocv2_7 != null) {
        worksheet.getCell(rowIndex, 20).value = lot.aging7Days.ocv2_7;
      }
      // U: IR2-7
      if (lot.aging7Days?.ir2_7 != null) {
        worksheet.getCell(rowIndex, 21).value = lot.aging7Days.ir2_7;
      }
      // V: Delta V
      if (lot.aging7Days?.deltaV != null) {
        worksheet.getCell(rowIndex, 22).value = lot.aging7Days.deltaV;
      }
      // W: Grading Equipment
      if (lot.grading?.equipment) {
        worksheet.getCell(rowIndex, 23).value = lot.grading.equipment;
      }
      // X: Grading CH No.
      if (lot.grading?.chNo) {
        worksheet.getCell(rowIndex, 24).value = lot.grading.chNo;
      }
      // Y: Grading MFD
      if (lot.grading?.mfd != null) {
        worksheet.getCell(rowIndex, 25).value = lot.grading.mfd;
      }
      // Z: Grading FormEff2
      if (lot.grading?.formEff2 != null) {
        worksheet.getCell(rowIndex, 26).value = lot.grading.formEff2;
      }
      // AA: Grading STC
      if (lot.grading?.stc != null) {
        worksheet.getCell(rowIndex, 27).value = lot.grading.stc;
      }
      // AB: Grading STD
      if (lot.grading?.std != null) {
        worksheet.getCell(rowIndex, 28).value = lot.grading.std;
      }
      // AC: Grading FormEff3
      if (lot.grading?.formEff3 != null) {
        worksheet.getCell(rowIndex, 29).value = lot.grading.formEff3;
      }
      // AD: Grading Temp
      if (lot.grading?.gradingTemp != null) {
        worksheet.getCell(rowIndex, 30).value = lot.grading.gradingTemp;
      }
      // AE: Grading Wh
      if (lot.grading?.wh != null) {
        worksheet.getCell(rowIndex, 31).value = lot.grading.wh;
      }
      // AF: Grading Nominal V
      if (lot.grading?.nominalV != null) {
        worksheet.getCell(rowIndex, 32).value = lot.grading.nominalV;
      }
      // AG: SOC Capacity
      if (lot.soc?.socCapacity != null) {
        worksheet.getCell(rowIndex, 33).value = lot.soc.socCapacity;
      }
      // AH: SOC
      if (lot.soc?.soc != null) {
        worksheet.getCell(rowIndex, 34).value = lot.soc.soc;
      }
      // AI: DC_IR
      if (lot.soc?.dcIr != null) {
        worksheet.getCell(rowIndex, 35).value = lot.soc.dcIr;
      }
      // AJ: OCV3
      if (lot.ocvIr3?.ocv3 != null) {
        worksheet.getCell(rowIndex, 36).value = lot.ocvIr3.ocv3;
      }
      // AK: IR3
      if (lot.ocvIr3?.ir3 != null) {
        worksheet.getCell(rowIndex, 37).value = lot.ocvIr3.ir3;
      }

      // 불량인 경우 배경색 적용 (연보라색 #DDA0DD)
      if (lot.isDefective) {
        const defectFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDA0DD' },
        };
        for (let col = 2; col <= 37; col++) {
          worksheet.getCell(rowIndex, col).fill = defectFill;
        }
      }

      rowIndex++;
    }

    // 컬럼 기본 스타일 제거 (템플릿 배경색 제거)
    const noFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'none',
    };
    for (let col = 2; col <= 37; col++) {
      const column = worksheet.getColumn(col);
      column.style = { ...column.style, fill: noFill };
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
