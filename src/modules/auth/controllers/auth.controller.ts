import { Request, Response } from 'express';
import { IAuthService } from '../services/auth.service.interface.js';
import { TokenUtil } from '../utils/token.util.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';
import { UnauthorizedError } from '../../../core/errors/app-error.js';

export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.register(req.body);
    TokenUtil.setAuthCookies(res, result.accessToken, result.refreshToken);

    return ApiResponse.created(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'User registered successfully. Please check your email to verify your account.'
    );
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.login(req.body);
    TokenUtil.setAuthCookies(res, result.accessToken, result.refreshToken);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Login successful'
    );
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const userId = req.user?.userId;

    await this.authService.logout(userId, refreshToken);
    TokenUtil.clearAuthCookies(res);

    return ApiResponse.success(res, null, 'Logged out successfully');
  };

  public refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const { accessToken, refreshToken } = await this.authService.refreshToken(rawRefreshToken);
    TokenUtil.setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.success(
      res,
      { accessToken },
      'Access token refreshed successfully'
    );
  };

  public forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.forgotPassword(req.body);
    return ApiResponse.success(res, null, result.message);
  };

  public resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.resetPassword(req.body);
    TokenUtil.clearAuthCookies(res);
    return ApiResponse.success(res, null, result.message);
  };

  public changePassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.authService.changePassword(userId, req.body);
    TokenUtil.clearAuthCookies(res);
    return ApiResponse.success(res, null, result.message);
  };

  public verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.verifyEmail(req.body);
    return ApiResponse.success(res, null, result.message);
  };

  public resendVerification = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.resendVerificationEmail(req.body);
    return ApiResponse.success(res, null, result.message);
  };
}
