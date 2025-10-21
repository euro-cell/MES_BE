import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder().setTitle('Swagger').setDescription('API Docs').build();
  const swaggerOptions: SwaggerCustomOptions = { swaggerOptions: { persistAuthorization: true } };
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerOptions);
}
