import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { Repository } from 'typeorm';
import {
  MixingProcessService,
  CoatingProcessService,
  PressProcessService,
  SlittingProcessService,
  NotchingProcessService,
} from './processes';
import { ProductionTargetDto } from 'src/common/dtos/production-target.dto';
import { ProductionTarget } from 'src/common/entities/production-target.entity';

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

  async getAssemblyStatus(_productionId: number, month: string) {
    return {
      category: 'assembly',
      month,
      processes: {
        vdCathode: null,
        vdAnode: null,
        forming: null,
        stacking: null,
        preWelding: null,
        mainWelding: null,
        sealing: null,
        filling: null,
      },
    };
  }
}
