import { RequestHandler, json } from 'express';

/**
 * export가 워크북 JSON(이미지 base64 포함 시 수 MB)을 받아야 해서 기본 100kb 제한을
 * 우회해야 함. 해당 라우트는 전역 파서를 건너뛰고 IqcProtoModule의 라우트별 미들웨어가
 * 대신 큰 limit으로 파싱한다.
 */
const BODY_PARSER_EXCLUDED_PATHS = ['/quality/iqc-proto/export'];

export function createDefaultJsonParser(): RequestHandler {
  const defaultParser = json();
  return (req, res, next) => {
    if (BODY_PARSER_EXCLUDED_PATHS.includes(req.path)) {
      return next();
    }
    return defaultParser(req, res, next);
  };
}
