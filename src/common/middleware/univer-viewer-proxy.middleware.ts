import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';

const UNIVER_DAEMON_HOST = '127.0.0.1';
const UNIVER_DAEMON_PORT = 9123;
const PROXY_PATH_PREFIX = '/univer-viewer';
// daemon 뷰어 HTML과 그 HTML이 실행하는 JS 번들(초기 스크립트 + 동적 import 청크) 양쪽 모두
// /assets/..., /uf/... 를 절대경로로 하드코딩해서 참조한다. 이 접두사들을 nginx에서 통째로
// 백엔드/daemon으로 열어버리면 프론트 앱 자신도 빌드 결과물을 /assets/*.js로 서빙하고 있어
// 충돌한다(실제로 프론트 화면이 깨짐). 그래서 nginx는 /univer-viewer 하나만 알면 되도록,
// daemon이 반환하는 HTML과 JS 응답 본문 모두에서 이 절대경로 문자열을 /univer-viewer 접두사가
// 붙은 경로로 재작성해서 내려준다.
const DAEMON_NATIVE_PATH_PREFIXES = ['/assets/', '/uf/'];
const REWRITABLE_CONTENT_TYPES = ['text/html', 'application/javascript', 'text/javascript'];

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

    // 브라우저가 보낸 헤더를 그대로 daemon에 넘기면, daemon이 이해하지 못하거나 거부하는
    // 조합(Range, If-None-Match 등 조건부/부분요청 헤더)이 섞여 들어가 정적 자산 요청이
    // 400으로 실패하는 경우가 있었다(동적 import 청크에서 재현). 꼭 필요한 헤더만 선별해서
    // 전달한다.
    // Node의 http.request는 헤더 값이 undefined면 예외를 던지므로(브라우저가 accept 등을
    // 보내지 않는 요청, 예: 일부 동적 import), 값이 실제로 있는 헤더만 골라 담는다.
    const forwardHeaders: http.OutgoingHttpHeaders = {
      host: `${UNIVER_DAEMON_HOST}:${UNIVER_DAEMON_PORT}`,
      // 압축된 응답 본문을 그대로 문자열로 재작성하면 깨지므로, daemon에는 압축 없는
      // 응답만 요청한다. HTML/JS 재작성 로직이 원본 텍스트를 직접 다뤄야 하기 때문.
      'accept-encoding': 'identity',
    };
    for (const name of ['accept', 'user-agent', 'cookie', 'content-type'] as const) {
      const value = req.headers[name];
      if (value !== undefined) forwardHeaders[name] = value;
    }

    const proxyReq = http.request(
      {
        host: UNIVER_DAEMON_HOST,
        port: UNIVER_DAEMON_PORT,
        path: daemonPath,
        method: req.method,
        headers: forwardHeaders,
      },
      proxyRes => {
        const contentType = proxyRes.headers['content-type'] ?? '';
        const isRewritable = REWRITABLE_CONTENT_TYPES.some(t => contentType.includes(t));
        if (!isRewritable) {
          res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
          proxyRes.pipe(res);
          return;
        }

        const chunks: Buffer[] = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const body = Buffer.concat(chunks)
            .toString('utf-8')
            // HTML의 src="/...", href="/..."
            .replace(/((?:src|href)=")\/(?!univer-viewer)/g, `$1${PROXY_PATH_PREFIX}/`)
            // JS 코드 안의 "/assets/...", "/uf/..." 문자열 리터럴 (동적 import, fetch 호출 등)
            .replace(/(["'`])\/(assets|uf)\//g, `$1${PROXY_PATH_PREFIX}/$2/`);
          const headers = { ...proxyRes.headers };
          delete headers['content-length'];
          // daemon은 정적 자산에 immutable/1년 캐시 헤더를 붙이는데, 우리가 본문을
          // 재작성했으므로 브라우저가 그 예전 캐시를 계속 쓰면 재작성 이전 상태로
          // 굳어버린다. 재작성 대상 응답은 캐시를 끈다.
          headers['cache-control'] = 'no-store';
          delete headers['etag'];
          res.writeHead(proxyRes.statusCode ?? 502, headers);
          res.end(body);
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
