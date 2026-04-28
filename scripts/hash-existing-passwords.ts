import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../src/common/entities/shared/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const users = await dataSource.getRepository(User).find();
  console.log(`총 ${users.length}명의 사용자 비밀번호를 변환합니다.`);

  for (const user of users) {
    // 이미 bcrypt 해시인 경우 건너뜀 ($2b$ 로 시작)
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      console.log(`[SKIP] userId=${user.id} (이미 해시됨)`);
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await dataSource.getRepository(User).update(user.id, { password: hashed });
    console.log(`[OK] userId=${user.id} 변환 완료`);
  }

  console.log('완료');
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
