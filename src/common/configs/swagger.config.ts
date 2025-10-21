import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Swagger')
    .setDescription('유로셀 MES API 문서')
    .setVersion('1.0.0')
    .addCookieAuth('connect.sid', {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
      description: 'express-session',
    })
    .build();
  const swaggerOptions: SwaggerCustomOptions = { swaggerOptions: { withCredentials: true, persistAuthorization: true } };
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerOptions);
}
