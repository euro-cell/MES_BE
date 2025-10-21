import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { setupSwagger } from './common/configs/swagger.config';
import { createCorsConfig } from './common/configs/cors.config';
import { createSessionConfig } from './common/configs/session.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');

  app.set('trust proxy', 1);

  app.enableCors(createCorsConfig(configService));

  app.use(session(createSessionConfig(configService)));

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  setupSwagger(app);

  await app.listen(PORT ?? 3000, '0.0.0.0');
  console.log('🚀 Server ON: ', await app.getUrl());
}
bootstrap();
