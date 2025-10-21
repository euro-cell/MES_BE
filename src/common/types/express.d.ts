// src/types/express.d.ts

import 'express';
import 'express-session';

// ✅ express-session의 세션 데이터 구조 확장
declare module 'express-session' {
  interface SessionData {
    passport?: { user?: any };
  }
}

// ✅ express.Request, express.Response 타입 확장
declare global {
  namespace Express {
    interface Request {
      logout(callback: (err?: any) => void): void;
      session: session.Session & Partial<session.SessionData>;
    }

    interface Response {
      clearCookie(name: string, options?: any): this;
    }
  }
}

export {};
