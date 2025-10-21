import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

export const createSessionConfig = (configService: ConfigService): session.SessionOptions => ({
  secret: configService.get<string>('SESSION_SECRET') || 'eurocell_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: configService.get<string>('SESSION_SECURE') === 'true',
    maxAge: Number(configService.get<string>('SESSION_MAX_AGE')) || 1000 * 60 * 30,
  },
});
