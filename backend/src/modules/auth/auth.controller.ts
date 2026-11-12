import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { token, admin } = await AuthService.login(req.body);

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return sendSuccess(res, 200, 'Authentication successful', {
      admin,
      token
    });
  }

  static async getMe(req: Request, res: Response) {
    return sendSuccess(res, 200, 'Current admin profile retrieved', req.admin);
  }

  static async logout(_req: Request, res: Response) {
    const isProduction = env.NODE_ENV === 'production';

    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax'
    });

    return sendSuccess(res, 200, 'Logged out successfully');
  }
}

