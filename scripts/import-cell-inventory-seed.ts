import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CellInventory } from '../src/common/entities/cell/cell-inventory.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [CellInventory],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  let seedData: any[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/common/seeds/cell-inventory.seed-data');
    seedData = mod.CELL_INVENTORY_SEED_DATA;
  } catch {
    console.error('seed 파일이 없습니다. 먼저 npm run seed:export:cell-inventory 를 실행하세요.');
    process.exit(1);
  }

  await dataSource.initialize();
  const repo = dataSource.getRepository(CellInventory);

  for (const row of seedData) {
    await repo.save(repo.create(row as any));
  }

  console.log(`완료: 삽입 ${seedData.length}건`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
