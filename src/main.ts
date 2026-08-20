import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { urlencoded } from 'express';
import * as net from 'net';
import { setupSwagger } from './common/configs/swagger.config';
import { createCorsConfig } from './common/configs/cors.config';
import { createSessionConfig } from './common/configs/session.config';
import { createDefaultJsonParser } from './common/configs/body-parser.config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

const UNIVER_DAEMON_HOST = '127.0.0.1';
const UNIVER_DAEMON_PORT = 9123;
const UNIVER_VIEWER_PATH_PREFIX = '/univer-viewer';

/**
 * Univer daemon의 Collab Gateway가 WebSocket(Upgrade)을 쓸 수 있어, HTTP 미들웨어로는
 * 처리되지 않는 upgrade 이벤트를 서버 레벨에서 직접 daemon(127.0.0.1:9123)으로 릴레이한다.
 * (UniverViewerProxyMiddleware는 일반 HTTP 요청만 처리한다.)
 */
function relayUniverViewerUpgrades(server: import('http').Server): void {
  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith(UNIVER_VIEWER_PATH_PREFIX)) return;

    const daemonSocket = net.connect(UNIVER_DAEMON_PORT, UNIVER_DAEMON_HOST, () => {
      const daemonPath = req.url!.slice(UNIVER_VIEWER_PATH_PREFIX.length) || '/';
      const headerLines = Object.entries(req.headers)
        .filter(([key]) => key.toLowerCase() !== 'host')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n');
      daemonSocket.write(
        `${req.method} ${daemonPath} HTTP/1.1\r\nHost: ${UNIVER_DAEMON_HOST}:${UNIVER_DAEMON_PORT}\r\n${headerLines}\r\n\r\n`,
      );
      daemonSocket.write(head);
      daemonSocket.pipe(socket);
      socket.pipe(daemonSocket);
    });

    daemonSocket.on('error', () => socket.destroy());
    socket.on('error', () => daemonSocket.destroy());
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');

  app.set('trust proxy', 1);

  app.use(createDefaultJsonParser());
  app.use(urlencoded({ extended: true }));

  app.enableCors(createCorsConfig(configService));

  app.use(session(createSessionConfig(configService)));

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  setupSwagger(app);

  await app.listen(PORT ?? 3000, '0.0.0.0');
  relayUniverViewerUpgrades(app.getHttpServer());
  console.log('🚀 Server ON: ', await app.getUrl());
}
bootstrap();
