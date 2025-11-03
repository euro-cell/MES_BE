import { ApiProperty, PartialType } from '@nestjs/swagger';

class ProcessDateRange {
  @ApiProperty()
  start: string;

  @ApiProperty()
  end: string;
}

class processPlans {
  @ApiProperty()
  'Electrode_Slurry Mixing_Cathode': ProcessDateRange;

  @ApiProperty()
  'Electrode_Slurry Mixing_Anode': ProcessDateRange;

  @ApiProperty()
  Electrode_Coating_Cathode: ProcessDateRange;

  @ApiProperty()
  Electrode_Coating_Anode: ProcessDateRange;

  @ApiProperty()
  Electrode_Calendering_Cathode: ProcessDateRange;

  @ApiProperty()
  Electrode_Calendering_Anode: ProcessDateRange;

  @ApiProperty()
  Electrode_Notching_Cathode: ProcessDateRange;

  @ApiProperty()
  Electrode_Notching_Anode: ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Pouch Forming': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Vacuum Drying_Cathode': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Vacuum Drying_Anode': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Stacking': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Tab Welding': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_Sealing': ProcessDateRange;

  @ApiProperty()
  'Cell Assembly_E/L Filling': ProcessDateRange;

  @ApiProperty()
  'Cell Formation_PF/MF': ProcessDateRange;

  @ApiProperty()
  'Cell Formation_Grading': ProcessDateRange;
}

class productionPlanDto {
  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  weekInfo?: string;

  @ApiProperty()
  processPlans: processPlans;
}

export class CreateProductionPlan2Dto extends PartialType(productionPlanDto) {}
