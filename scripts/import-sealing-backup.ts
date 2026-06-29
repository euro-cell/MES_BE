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
  const backupPath = path.resolve(__dirname, '../src/common/seeds/worklog_sealings_backup.json');

  if (!fs.existsSync(backupPath)) {
    console.error('백업 파일이 없습니다. 먼저 export-sealing-backup 을 실행하세요.');
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  await dataSource.initialize();

  let restored = 0;
  let skipped = 0;

  for (const row of rows) {
    const exists = await dataSource.query(`SELECT id FROM worklog_sealings WHERE id = $1`, [row.id]);

    if (exists.length > 0) {
      skipped++;
      continue;
    }

    const keys = Object.keys(row);
    const values = Object.values(row);
    const cols = keys.map((k) => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');

    await dataSource.query(`INSERT INTO worklog_sealings (${cols}) VALUES (${params})`, values);
    restored++;
  }

  console.log(`복구 완료: 삽입 ${restored}건, 중복 스킵 ${skipped}건`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
