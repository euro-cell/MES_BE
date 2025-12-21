export class ProductionProgressDto {
  electrode: number; // 전극 진행률 (0-100)
  assembly: number; // 조립 진행률 (0-100)
  formation: number; // 화성 진행률 (0-100)
  overall?: number; // 전체 진행률 (0-100)
}
