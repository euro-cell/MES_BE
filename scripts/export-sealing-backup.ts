import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
  entities: [],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
});

async function main() {
  await dataSource.initialize();

  const rows = await dataSource.query(`SELECT * FROM worklog_sealings ORDER BY id ASC`);

  const outPath = path.resolve(__dirname, '../src/common/seeds/worklog_sealings_backup.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8');

  console.log(`백업 완료: ${rows.length}건 → ${outPath}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
