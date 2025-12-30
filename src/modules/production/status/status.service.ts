import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { Repository } from 'typeorm';
import {
  MixingProcessService,
  CoatingProcessService,
  PressProcessService,
  SlittingProcessService,
  NotchingProcessService,
  VdProcessService,
  FormingProcessService,
  StackingProcessService,
  WeldingProcessService,
  SealingProcessService,
  FillingProcessService,
  FormationProcessService,
  GradingProcessService,
  VisualInspectionProcessService,
} from './processes';
import { ProductionTargetDto, UpdateTargetByKeyDto } from 'src/common/dtos/production-target.dto';
import { ProductionTarget } from 'src/common/entities/production-target.entity';
import { ProductionProgressDto } from 'src/common/dtos/production-progress.dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
    private readonly mixingProcessService: MixingProcessService,
    private readonly coatingProcessService: CoatingProcessService,
    private readonly pressProcessService: PressProcessService,
    private readonly slittingProcessService: SlittingProcessService,
    private readonly notchingProcessService: NotchingProcessService,
    private readonly vdProcessService: VdProcessService,
    private readonly formingProcessService: FormingProcessService,
    private readonly stackingProcessService: StackingProcessService,
    private readonly weldingProcessService: WeldingProcessService,
    private readonly sealingProcessService: SealingProcessService,
    private readonly fillingProcessService: FillingProcessService,
    private readonly formationProcessService: FormationProcessService,
    private readonly gradingProcessService: GradingProcessService,
    private readonly visualInspectionProcessService: VisualInspectionProcessService,
  ) {}

  async targetStatus(productionId: number, dto: ProductionTargetDto) {
    const existingTarget = await this.productionTargetRepository.findOne({
      where: { production: { id: productionId } },
    });
    let target: ProductionTarget;

    if (existingTarget) {
      Object.keys(dto).forEach((key) => {
        if (dto[key] !== undefined && dto[key] !== null) {
          existingTarget[key] = dto[key];
        }
      });
      target = await this.productionTargetRepository.save(existingTarget);
    } else {
      const newTarget = this.productionTargetRepository.create({
        production: { id: productionId },
        ...dto,
      });
      target = await this.productionTargetRepository.save(newTarget);
    }
    return target;
  }

  async getStatusData(productionId: number) {
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { production: { id: productionId } },
      relations: ['production'],
    });

    if (!productionPlan) {
      return { name: null, startDate: null, endDate: null };
    }

    return {
      name: productionPlan.production.name,
      startDate: productionPlan.startDate,
      endDate: productionPlan.endDate,
    };
  }

  async getElectrodeStatus(productionId: number, month: string, type: 'cathode' | 'anode') {
    const [mixing, coating, press, slitting, notching] = await Promise.all([
      this.mixingProcessService.getMonthlyData(productionId, month, type),
      this.coatingProcessService.getMonthlyData(productionId, month, type),
      this.pressProcessService.getMonthlyData(productionId, month, type),
      this.slittingProcessService.getMonthlyData(productionId, month, type),
      this.notchingProcessService.getMonthlyData(productionId, month, type),
    ]);

    return {
      category: 'electrode',
      type,
      month,
      processes: {
        mixing,
        coatingSingle: coating.single,
        coatingDouble: coating.double,
        press,
        slitting,
        notching,
      },
    };
  }

  async getAssemblyStatus(productionId: number, month: string) {
    const [vd, forming, stacking, welding, sealing, filling] = await Promise.all([
      this.vdProcessService.getMonthlyData(productionId, month),
      this.formingProcessService.getMonthlyData(productionId, month),
      this.stackingProcessService.getMonthlyData(productionId, month),
      this.weldingProcessService.getMonthlyData(productionId, month),
      this.sealingProcessService.getMonthlyData(productionId, month),
      this.fillingProcessService.getMonthlyData(productionId, month),
    ]);

    return {
      category: 'assembly',
      month,
      processes: {
        vd,
        forming,
        stacking,
        preWelding: welding.preWelding,
        mainWelding: welding.mainWelding,
        sealing,
        filling,
      },
    };
  }

  async getFormationStatus(productionId: number, month: string) {
    const [formation, grading, visualInspection] = await Promise.all([
      this.formationProcessService.getMonthlyData(productionId, month),
      this.gradingProcessService.getMonthlyData(productionId, month),
      this.visualInspectionProcessService.getMonthlyData(productionId, month),
    ]);

    return {
      category: 'formation',
      month,
      processes: {
        preFormation: formation.preFormation,
        degas: formation.degas,
        mainFormation: formation.mainFormation,
        aging: grading.aging,
        grading: grading.grading,
        visualInspection,
      },
    };
  }

  async updateTargetStatus(productionId: number, dto: UpdateTargetByKeyDto) {
    const { processKey, targetQuantity } = dto;

    let target = await this.productionTargetRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (!target) {
      target = this.productionTargetRepository.create({ production: { id: productionId } });
    }

    if (!(processKey in target)) {
      throw new ConflictException(`유효하지 않은 공정 키입니다: ${processKey}`);
    }

    target[processKey] = targetQuantity;
    return await this.productionTargetRepository.save(target);
  }

  async getProgress(productionId: number): Promise<ProductionProgressDto> {
    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const [electrodeData, assemblyData, formationData] = await Promise.all([
      this.calculateElectrodeProgress(productionId, month),
      this.calculateAssemblyProgress(productionId, month),
      this.calculateFormationProgress(productionId, month),
    ]);

    const overall = Math.round(((electrodeData + assemblyData + formationData) / 3) * 100) / 100;

    return { electrode: electrodeData, assembly: assemblyData, formation: formationData, overall };
  }

  private async calculateElectrodeProgress(productionId: number, month: string): Promise<number> {
    try {
      const [cathodeData, anodeData] = await Promise.all([
        this.getElectrodeStatus(productionId, month, 'cathode'),
        this.getElectrodeStatus(productionId, month, 'anode'),
      ]);

      const progressValues: number[] = [];

      // Cathode 공정별 진행률 수집
      if (cathodeData.processes.mixing?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.mixing.total.progress);
      }
      if (cathodeData.processes.coatingSingle?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.coatingSingle.total.progress);
      }
      if (cathodeData.processes.coatingDouble?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.coatingDouble.total.progress);
      }
      if (cathodeData.processes.press?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.press.total.progress);
      }
      if (cathodeData.processes.slitting?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.slitting.total.progress);
      }
      if (cathodeData.processes.notching?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.notching.total.progress);
      }

      // Anode 공정별 진행률 수집
      if (anodeData.processes.mixing?.total?.progress !== null) {
        progressValues.push(anodeData.processes.mixing.total.progress);
      }
      if (anodeData.processes.coatingSingle?.total?.progress !== null) {
        progressValues.push(anodeData.processes.coatingSingle.total.progress);
      }
      if (anodeData.processes.coatingDouble?.total?.progress !== null) {
        progressValues.push(anodeData.processes.coatingDouble.total.progress);
      }
      if (anodeData.processes.press?.total?.progress !== null) {
        progressValues.push(anodeData.processes.press.total.progress);
      }
      if (anodeData.processes.slitting?.total?.progress !== null) {
        progressValues.push(anodeData.processes.slitting.total.progress);
      }
      if (anodeData.processes.notching?.total?.progress !== null) {
        progressValues.push(anodeData.processes.notching.total.progress);
      }

      // 평균 진행률 계산
      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAssemblyProgress(productionId: number, month: string): Promise<number> {
    try {
      const assemblyData = await this.getAssemblyStatus(productionId, month);
      const progressValues: number[] = [];

      // VD - cathode와 anode 진행률
      if (assemblyData.processes.vd?.total?.cathode?.progress !== null) {
        progressValues.push(assemblyData.processes.vd.total.cathode.progress);
      }
      if (assemblyData.processes.vd?.total?.anode?.progress !== null) {
        progressValues.push(assemblyData.processes.vd.total.anode.progress);
      }

      // Forming - 루트 레벨의 progress
      if (assemblyData.processes.forming?.progress !== null) {
        progressValues.push(assemblyData.processes.forming.progress);
      }

      // Stacking
      if (assemblyData.processes.stacking?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.stacking.total.progress);
      }

      // Welding - preWelding과 mainWelding
      if (assemblyData.processes.preWelding?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.preWelding.total.progress);
      }
      if (assemblyData.processes.mainWelding?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.mainWelding.total.progress);
      }

      // Sealing
      if (assemblyData.processes.sealing?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.sealing.total.progress);
      }

      // Filling
      if (assemblyData.processes.filling?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.filling.total.progress);
      }

      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }

  private async calculateFormationProgress(productionId: number, month: string): Promise<number> {
    try {
      const formationData = await this.getFormationStatus(productionId, month);
      const progressValues: number[] = [];

      // Formation - preFormation, degas, mainFormation
      if (formationData.processes.preFormation?.total?.progress !== null) {
        progressValues.push(formationData.processes.preFormation.total.progress);
      }
      if (formationData.processes.degas?.total?.progress !== null) {
        progressValues.push(formationData.processes.degas.total.progress);
      }
      if (formationData.processes.mainFormation?.total?.progress !== null) {
        progressValues.push(formationData.processes.mainFormation.total.progress);
      }

      // Grading - aging과 grading
      if (formationData.processes.aging?.total?.progress !== null) {
        progressValues.push(formationData.processes.aging.total.progress);
      }
      if (formationData.processes.grading?.total?.progress !== null) {
        progressValues.push(formationData.processes.grading.total.progress);
      }

      // Visual Inspection
      if (formationData.processes.visualInspection?.total?.progress !== null) {
        progressValues.push(formationData.processes.visualInspection.total.progress);
      }

      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }
}
