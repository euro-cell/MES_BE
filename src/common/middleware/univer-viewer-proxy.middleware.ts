import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';

const UNIVER_DAEMON_HOST = '127.0.0.1';
const UNIVER_DAEMON_PORT = 9123;
const PROXY_PATH_PREFIX = '/univer-viewer';

/**
 * Univer CLI daemon은 컨테이너 루프백(127.0.0.1:9123)에만 바인딩되어 nginx 같은 다른
 * 컨테이너에서 직접 접근할 수 없다. 백엔드는 daemon과 같은 컨테이너 안이라 127.0.0.1로
 * 접근 가능하므로, /univer-viewer 경로 요청을 그대로 daemon에 릴레이하는 프록시 역할을 한다.
 */
@Injectable()
export class UniverViewerProxyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (!req.path.startsWith(PROXY_PATH_PREFIX)) {
      next();
      return;
    }

    const daemonPath = req.originalUrl.slice(PROXY_PATH_PREFIX.length) || '/';

    const proxyReq = http.request(
      {
        host: UNIVER_DAEMON_HOST,
        port: UNIVER_DAEMON_PORT,
        path: daemonPath,
        method: req.method,
        headers: { ...req.headers, host: `${UNIVER_DAEMON_HOST}:${UNIVER_DAEMON_PORT}` },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.status(502).json({ message: 'Univer daemon에 연결할 수 없습니다.' });
      }
    });

    req.pipe(proxyReq);
  }
}
