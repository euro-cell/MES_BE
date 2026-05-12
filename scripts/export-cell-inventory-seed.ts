import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CellInventory } from '../src/common/entities/cell/cell-inventory.entity';
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
  entities: [CellInventory],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const rows = await dataSource.getRepository(CellInventory).find({
    withDeleted: false,
    order: { id: 'ASC' },
  });

  const data = rows.map((r) => ({
    lot: r.lot,
    projectName: r.projectName,
    projectNo: r.projectNo ?? null,
    model: r.model ?? null,
    grade: r.grade,
    ncrGrade: r.ncrGrade ?? null,
    date: r.date,
    storageLocation: r.storageLocation ?? null,
    shippingDate: r.shippingDate ?? null,
    shippingStatus: r.shippingStatus ?? null,
    deliverer: r.deliverer,
    receiver: r.receiver,
    details: r.details ?? null,
    isShipped: r.isShipped ?? false,
    isRestocked: r.isRestocked ?? false,
  }));

  const output = `// 자동 생성된 시드 파일 — export-cell-inventory-seed.ts 로 생성
import { CellGrade } from '../../common/enums/cell-inventory.enum';

export const CELL_INVENTORY_SEED_DATA = ${JSON.stringify(data, null, 2)} as const;
`;

  const outPath = path.resolve(__dirname, '../src/common/seeds/cell-inventory.seed-data.ts');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`완료: ${data.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
