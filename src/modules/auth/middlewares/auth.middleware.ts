import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/token.util.js';
import { User, UserRole } from '../models/user.model.js';
import {
  UnauthorizedError,
  ForbiddenError,
} from '../../../core/errors/app-error.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Extract Bearer token from Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HTTP-only Cookie
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    // 3. Verify Access Token
    const decoded = TokenUtil.verifyAccessToken(token);

    // 4. Check if user still exists in database
    const currentUser = await User.findById(decoded.userId).select(
      '+passwordChangedAt +accountStatus'
    );

    if (!currentUser) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    if (currentUser.accountStatus === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended. Please contact support.');
    }

    // 5. Check if password was changed after token issuance
    if (decoded.iat && currentUser.isPasswordChangedAfterTokenIssued(decoded.iat)) {
      throw new UnauthorizedError(
        'User recently changed password. Please log in again.'
      );
    }

    // 6. Grant access by attaching decoded user to request
    req.user = decoded;
    next();
  }
);

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};
