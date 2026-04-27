import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Material } from '../src/common/entities/material/material.entity';
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
  entities: [Material],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const materials = await dataSource.getRepository(Material).find({
    withDeleted: false,
    order: { id: 'ASC' },
  });

  const rows = materials.map((m) => ({
    process: m.process,
    category: m.category,
    type: m.type,
    purpose: m.purpose,
    name: m.name,
    spec: m.spec ?? null,
    lotNo: m.lotNo ?? null,
    company: m.company ?? null,
    origin: m.origin,
    unit: m.unit,
    price: m.price ?? null,
    note: m.note ?? null,
    stock: m.stock ?? 0,
  }));

  const output = `// 자동 생성된 시드 파일 — export-material-seed.ts 로 생성
import { MaterialOrigin, MaterialProcess, MaterialPurpose } from '../../common/enums/material.enum';

export const MATERIAL_SEED_DATA = ${JSON.stringify(rows, null, 2)} as const;
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/material.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${rows.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
