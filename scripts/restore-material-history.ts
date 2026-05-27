import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Material } from '../src/common/entities/material/material.entity';
import { MaterialHistory } from '../src/common/entities/material/material-history.entity';
import * as dotenv from 'dotenv';
import { MATERIAL_HISTORY_SEED_DATA } from '../src/common/seeds/material-history.seed-data';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Material, MaterialHistory],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(MaterialHistory);

  // 기존 데이터 전체 삭제 후 재삽입
  await repo.query('TRUNCATE TABLE material_histories RESTART IDENTITY CASCADE');

  for (const row of MATERIAL_HISTORY_SEED_DATA) {
    await repo.query(
      `INSERT INTO material_histories (id, material_id, process, type, previous_stock, current_stock, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [row.id, row.materialId, row.process, row.type, row.previousStock, row.currentStock, row.createdAt, row.updatedAt],
    );
  }

  // sequence 재설정
  await repo.query(`SELECT setval('material_histories_id_seq', (SELECT MAX(id) FROM material_histories))`);

  console.log(`완료: ${MATERIAL_HISTORY_SEED_DATA.length}건 복구`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
