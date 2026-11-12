import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { ApiError } from '../utils/ApiError';

export const authenticateAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check signed cookies or standard cookies first (HttpOnly cookie: admin_token)
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } else if (req.signedCookies && req.signedCookies.admin_token) {
      token = req.signedCookies.admin_token;
    }

    // Fallback to Bearer token in Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in.'));
    }

    let payload;
    try {
      payload = AuthService.verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Your session has expired. Please log in again.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    const admin = await AuthService.getAdminById(payload.id);
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

