import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Material } from '../src/common/entities/material/material.entity';
import * as dotenv from 'dotenv';
import { MATERIAL_SEED_DATA } from '../src/common/seeds/material.seed-data';

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
  const repo = dataSource.getRepository(Material);

  let updated = 0;
  let skipped = 0;

  for (const seed of MATERIAL_SEED_DATA as unknown as any[]) {
    if (!seed.stock || seed.stock === 0) continue;

    const material = seed.lotNo
      ? await repo.findOne({ where: { lotNo: seed.lotNo } })
      : await repo.findOne({ where: { name: seed.name } });

    if (!material) {
      console.log(`[SKIP] 찾을 수 없음: ${seed.name} / ${seed.lotNo}`);
      skipped++;
      continue;
    }

    await repo.update(material.id, { stock: seed.stock });
    console.log(`[OK] id=${material.id} ${seed.name} stock=${seed.stock}`);
    updated++;
  }

  console.log(`\n완료: ${updated}건 복구, ${skipped}건 스킵`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
