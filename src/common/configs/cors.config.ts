import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const createCorsConfig = (configService: ConfigService): CorsOptions => ({
  origin: configService.get<string>('FRONTEND_ORIGIN') || 'http://localhost:5173',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
});
