import { JwtAccessTokenPayload } from '../modules/auth/utils/token.util.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessTokenPayload;
    }
  }
}

export {};
