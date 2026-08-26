import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../../core/middlewares/rate-limiter.middleware.js';
import { validateRequest } from '../../../core/middlewares/validate.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Instantiate Dependency Injection Tree
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// 1. Registration
router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(authController.register)
);

// 2. Login
router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  asyncHandler(authController.login)
);

// 3. Logout
router.post(
  '/logout',
  asyncHandler(authController.logout)
);

// 4. Refresh Token
router.post(
  '/refresh-token',
  authRateLimiter,
  validateRequest(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);

// 5. Forgot Password
router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

// 6. Reset Password
router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

// 7. Change Password (Protected)
router.post(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  asyncHandler(authController.changePassword)
);
router.patch(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

// 8. Verify Email
router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  asyncHandler(authController.verifyEmail)
);

// 9. Resend Verification Email
router.post(
  '/resend-verification',
  authRateLimiter,
  validateRequest(resendVerificationSchema),
  asyncHandler(authController.resendVerification)
);

export const authRoutes = router;
