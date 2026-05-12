import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CellNcr } from '../src/common/entities/cell/cell-ncr.entity';
import { CellNcrDetail } from '../src/common/entities/cell/cell-ncr-detail.entity';
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
  entities: [CellNcr, CellNcrDetail],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const ncrs = await dataSource.getRepository(CellNcr).find({
    relations: ['cellNcrDetails'],
    order: { id: 'ASC' },
  });

  const data = ncrs.map((n) => ({
    category: n.category,
    ncrType: n.ncrType,
    code: n.code,
    title: n.title,
    cellNcrDetails: (n.cellNcrDetails ?? []).map((d) => ({
      projectName: d.projectName,
      title: d.title,
      details: d.details,
      type: d.type,
      count: d.count,
    })),
  }));

  const output = `// 자동 생성된 시드 파일 — export-cell-ncr-seed.ts 로 생성

export const CELL_NCR_SEED_DATA = ${JSON.stringify(data, null, 2)} as const;
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/cell-ncr.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${data.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
