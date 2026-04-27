import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Equipment } from '../src/common/entities/equipment/equipment.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Equipment],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const equipments = await dataSource.getRepository(Equipment).find({
    order: { id: 'ASC' },
  });

  const rows = equipments.map((e) => ({
    category: e.category,
    processType: e.processType ?? null,
    assetNo: e.assetNo ?? null,
    equipmentNo: e.equipmentNo,
    name: e.name,
    manufacturer: e.manufacturer,
    purchaseDate: e.purchaseDate ?? null,
    grade: e.grade ?? null,
    maintenanceMethod: e.maintenanceMethod ?? null,
    remark: e.remark ?? null,
    deviceNo: e.deviceNo ?? null,
    calibrationDate: e.calibrationDate ?? null,
    nextCalibrationDate: e.nextCalibrationDate ?? null,
    calibrationAgency: e.calibrationAgency ?? null,
  }));

  const output = `// 자동 생성된 시드 파일 — export-equipment-seed.ts 로 생성
import { EquipmentCategory, EquipmentGrade, EquipmentProcess } from '../../common/enums/equipment.enum';

export const EQUIPMENT_SEED_DATA = ${JSON.stringify(rows, null, 2)} as const;
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/equipment.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${rows.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
