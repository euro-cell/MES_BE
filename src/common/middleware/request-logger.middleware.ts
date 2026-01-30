import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    // 실제 IP 주소 (프록시 뒤에 있는 경우 X-Forwarded-For 헤더 확인)
    const clientIp = req.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || ip;

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;

      const logMessage = `[${clientIp}] ${method} ${originalUrl} ${statusCode} ${responseTime}ms`;

      // 상태 코드에 따라 로그 레벨 구분
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
