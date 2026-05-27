import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Material } from '../src/common/entities/material/material.entity';
import { MaterialHistory } from '../src/common/entities/material/material-history.entity';
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
  entities: [Material, MaterialHistory],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const histories = await dataSource.getRepository(MaterialHistory).find({ order: { id: 'ASC' } });

  const rows = histories.map((h) => ({
    id: h.id,
    materialId: h.materialId,
    process: h.process,
    type: h.type,
    previousStock: h.previousStock,
    currentStock: h.currentStock,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }));

  const output = `// 자동 생성된 시드 파일 — export-material-history-seed.ts 로 생성
export const MATERIAL_HISTORY_SEED_DATA = ${JSON.stringify(rows, null, 2)};
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/material-history.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${rows.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
