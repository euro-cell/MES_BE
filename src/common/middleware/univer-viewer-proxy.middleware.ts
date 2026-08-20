import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';

const UNIVER_DAEMON_HOST = '127.0.0.1';
const UNIVER_DAEMON_PORT = 9123;
const PROXY_PATH_PREFIX = '/univer-viewer';
// daemon 뷰어의 JS 번들(초기 스크립트와, 그 스크립트가 다시 동적 import하는 청크 양쪽 다)이
// /assets/..., /uf/... 를 절대경로로 하드코딩해서 호출한다. 초기 HTML의 src/href는 재작성해서
// /univer-viewer 접두사를 붙이지만, 동적 import 경로는 JS 코드 문자열 안에 있어 HTML 재작성으로
// 잡을 수 없다. 이 두 접두사는 daemon 고유 경로라 프론트 앱과 겹칠 일이 없는 별도 컨테이너
// 환경(nginx가 프론트/백엔드를 분리 라우팅)에서는 그대로 릴레이해도 안전하다.
// (로컬 dev 서버(Vite)에서는 자체 정적 서빙이 /assets를 먼저 가로채 별도 프록시 설정 필요.)
const DAEMON_NATIVE_PATH_PREFIXES = ['/assets/', '/uf/'];

/**
 * Univer CLI daemon은 컨테이너 루프백(127.0.0.1:9123)에만 바인딩되어 nginx 같은 다른
 * 컨테이너에서 직접 접근할 수 없다. 백엔드는 daemon과 같은 컨테이너 안이라 127.0.0.1로
 * 접근 가능하므로, /univer-viewer 경로 요청을 그대로 daemon에 릴레이하는 프록시 역할을 한다.
 */
@Injectable()
export class UniverViewerProxyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // forRoutes('*')로 등록된 NestMiddleware는 내부적으로 하위 라우터에 마운트되어,
    // req.path가 전체 경로가 아니라 마운트 지점 기준 상대 경로(대부분 '/')로 찍힌다.
    // 그래서 경로 필터링은 반드시 req.originalUrl 기준으로 해야 한다.
    const isViewerRequest = req.originalUrl.startsWith(PROXY_PATH_PREFIX);
    const isNativeRequest = DAEMON_NATIVE_PATH_PREFIXES.some(p => req.originalUrl.startsWith(p));
    if (!isViewerRequest && !isNativeRequest) {
      next();
      return;
    }

    const daemonPath = isViewerRequest ? req.originalUrl.slice(PROXY_PATH_PREFIX.length) || '/' : req.originalUrl;

    const proxyReq = http.request(
      {
        host: UNIVER_DAEMON_HOST,
        port: UNIVER_DAEMON_PORT,
        path: daemonPath,
        method: req.method,
        headers: { ...req.headers, host: `${UNIVER_DAEMON_HOST}:${UNIVER_DAEMON_PORT}` },
      },
      proxyRes => {
        const contentType = proxyRes.headers['content-type'] ?? '';
        if (!contentType.includes('text/html')) {
          res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
          proxyRes.pipe(res);
          return;
        }

        const chunks: Buffer[] = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const html = Buffer.concat(chunks)
            .toString('utf-8')
            .replace(/((?:src|href)=")\/(?!univer-viewer)/g, `$1${PROXY_PATH_PREFIX}/`);
          const headers = { ...proxyRes.headers };
          delete headers['content-length'];
          res.writeHead(proxyRes.statusCode ?? 502, headers);
          res.end(html);
        });
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
