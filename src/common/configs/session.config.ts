import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const connectPgSimple = require('connect-pg-simple');
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);

export const createSessionConfig = (configService: ConfigService): session.SessionOptions => {
  const pool = new Pool({
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    user: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
  });

  return {
    store: new PgSession({
      pool,
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
    }),
    secret: configService.get<string>('SESSION_SECRET') || 'eurocell_secret_key',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: configService.get<string>('SESSION_SECURE') === 'true',
      maxAge: Number(configService.get<string>('SESSION_MAX_AGE')) || 1000 * 60 * 30,
    },
  };
};
