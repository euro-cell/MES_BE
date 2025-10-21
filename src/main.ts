import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { setupSwagger } from './common/configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(
    session({
      secret: 'eurocell_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 30 }, // 30분 유지
    }),
  );

  setupSwagger(app);

  await app.listen(PORT ?? 3000, '0.0.0.0');
  console.log('🚀 Server ON: ', await app.getUrl());
}
bootstrap();
