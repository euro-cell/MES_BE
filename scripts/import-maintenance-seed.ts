import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Equipment } from '../src/common/entities/equipment/equipment.entity';
import { Maintenance } from '../src/common/entities/equipment/maintenance.entity';
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
  let seedData: any[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/common/seeds/maintenance.seed-data');
    seedData = mod.MAINTENANCE_SEED_DATA;
  } catch {
    console.error('seed 파일이 없습니다. 먼저 npm run seed:export:maintenance 를 실행하세요.');
    process.exit(1);
  }

  await dataSource.initialize();
  const equipmentRepo = dataSource.getRepository(Equipment);
  const maintenanceRepo = dataSource.getRepository(Maintenance);

  let inserted = 0;
  let skipped = 0;

  for (const row of seedData) {
    const equipment = await equipmentRepo.findOne({ where: { equipmentNo: row.equipmentNo } });
    if (!equipment) {
      console.warn(`설비를 찾을 수 없어 스킵: equipmentNo=${row.equipmentNo}`);
      skipped++;
      continue;
    }

    // equipmentId + inspectionDate 기준 중복 체크
    const exists = await maintenanceRepo.findOne({
      where: { equipmentId: equipment.id, inspectionDate: row.inspectionDate },
    });
    if (exists) {
      skipped++;
      continue;
    }

    await maintenanceRepo.save(
      maintenanceRepo.create({
        equipmentId: equipment.id,
        inspectionDate: row.inspectionDate,
        replacementHistory: row.replacementHistory,
        usedParts: row.usedParts,
        maintainer: row.maintainer,
        verifier: row.verifier,
        remark: row.remark,
      }),
    );
    inserted++;
  }

  console.log(`완료: 삽입 ${inserted}건, 중복 스킵 ${skipped}건`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
