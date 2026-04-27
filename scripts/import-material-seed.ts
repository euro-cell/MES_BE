import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Material } from '../src/common/entities/material/material.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Material],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  // seed-data 파일이 존재하는지 확인
  let seedData: any[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/common/seeds/material.seed-data');
    seedData = mod.MATERIAL_SEED_DATA;
  } catch {
    console.error('seed 파일이 없습니다. 먼저 npm run seed:export:material 을 실행하세요.');
    process.exit(1);
  }

  await dataSource.initialize();
  const repo = dataSource.getRepository(Material);

  let inserted = 0;
  let skipped = 0;

  for (const row of seedData) {
    const exists = await repo.findOne({
      where: { name: row.name, process: row.process, category: row.category },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await repo.save(repo.create(row));
    inserted++;
  }

  console.log(`완료: 삽입 ${inserted}건, 중복 스킵 ${skipped}건`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
