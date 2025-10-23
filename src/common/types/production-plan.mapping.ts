import { ProductionPlan } from '../entities/production-plan.entity';

export const PRODUCTION_PLAN_MAPPING: Record<string, keyof ProductionPlan> = {
  'Electrode_Slurry Mixing_Cathode': 'mixingCathode',
  'Electrode_Slurry Mixing_Anode': 'mixingAnode',
  Electrode_Coating_Cathode: 'coatingCathode',
  Electrode_Coating_Anode: 'coatingAnode',
  Electrode_Calendering_Cathode: 'calenderingCathode',
  Electrode_Calendering_Anode: 'calenderingAnode',
  Electrode_Notching_Cathode: 'notchingCathode',
  Electrode_Notching_Anode: 'notchingAnode',

  'Cell Assembly_Pouch Forming': 'pouch_forming',
  'Cell Assembly_Vacuum Drying_Cathode': 'vacuumDryingCathode',
  'Cell Assembly_Vacuum Drying_Anode': 'vacuumDryingAnode',
  'Cell Assembly_Stacking': 'stacking',
  'Cell Assembly_Tab Welding': 'tabWelding',
  'Cell Assembly_Sealing': 'sealing',
  'Cell Assembly_E/L Filling': 'elFilling',

  'Cell Formation_PF/MF': 'pfMf',
  'Cell Formation_Grading': 'grading',
};
