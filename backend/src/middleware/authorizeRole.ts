import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AdminRole } from '../modules/auth/auth.model';

export const authorizeRole = (...allowedRoles: AdminRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return next(
        ApiError.forbidden(
          `Permission denied: Requires one of [${allowedRoles.join(', ')}] role(s)`
        )
      );
    }

    next();
  };
};

