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
  const repo = dataSource.getRepository(User);

  const users = await repo.find({ withDeleted: false, order: { employeeNumber: 'ASC' } });

  for (const user of users) {
    const plain = `eurocell${user.employeeNumber}`;
    const hashed = await bcrypt.hash(plain, 10);
    await repo.update(user.id, { password: hashed });
    console.log(`${user.name} (${user.employeeNumber}) → ${plain}`);
  }

  console.log(`\n완료: ${users.length}명 비밀번호 초기화`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
