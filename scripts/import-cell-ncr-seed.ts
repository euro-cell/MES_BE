import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CellNcr } from '../src/common/entities/cell/cell-ncr.entity';
import { CellNcrDetail } from '../src/common/entities/cell/cell-ncr-detail.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [CellNcr, CellNcrDetail],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  let seedData: any[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/common/seeds/cell-ncr.seed-data');
    seedData = mod.CELL_NCR_SEED_DATA;
  } catch {
    console.error('seed 파일이 없습니다. 먼저 npm run seed:export:cell-ncr 를 실행하세요.');
    process.exit(1);
  }

  await dataSource.initialize();
  const ncrRepo = dataSource.getRepository(CellNcr);

  let inserted = 0;
  let skipped = 0;

  for (const row of seedData) {
    const exists = await ncrRepo.findOne({ where: { code: row.code } });
    if (exists) {
      skipped++;
      continue;
    }

    await ncrRepo.save(
      ncrRepo.create({
        category: row.category,
        ncrType: row.ncrType,
        code: row.code,
        title: row.title,
        cellNcrDetails: row.cellNcrDetails,
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
