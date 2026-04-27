import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Equipment } from '../src/common/entities/equipment/equipment.entity';
import { Maintenance } from '../src/common/entities/equipment/maintenance.entity';
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
  entities: [Equipment, Maintenance],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const maintenances = await dataSource.getRepository(Maintenance).find({
    relations: ['equipment'],
    order: { id: 'ASC' },
  });

  // equipmentId 대신 equipmentNo로 저장 (운영 DB에서 매핑용)
  const rows = maintenances.map((m) => ({
    equipmentNo: m.equipment.equipmentNo,
    inspectionDate: m.inspectionDate,
    replacementHistory: m.replacementHistory ?? null,
    usedParts: m.usedParts ?? null,
    maintainer: m.maintainer ?? null,
    verifier: m.verifier ?? null,
    remark: m.remark ?? null,
  }));

  const output = `// 자동 생성된 시드 파일 — export-maintenance-seed.ts 로 생성

export const MAINTENANCE_SEED_DATA = ${JSON.stringify(rows, null, 2)} as const;
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/maintenance.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${rows.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
