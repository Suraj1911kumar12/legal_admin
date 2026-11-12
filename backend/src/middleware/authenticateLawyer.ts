import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Lawyer, ILawyer } from '../modules/lawyers/lawyer.model';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export interface LawyerTokenPayload {
  id: string;
  email: string;
  role: 'lawyer';
}

export const authenticateLawyer = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check HttpOnly cookie lawyer_token
    if (req.cookies && req.cookies.lawyer_token) {
      token = req.cookies.lawyer_token;
    } else if (req.signedCookies && req.signedCookies.lawyer_token) {
      token = req.signedCookies.lawyer_token;
    }

    // Fallback to Bearer token in header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in to your lawyer account.'));
    }

    let payload: LawyerTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as LawyerTokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Your session has expired. Please log in again.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    if (payload.role !== 'lawyer') {
      return next(ApiError.forbidden('Access denied: Lawyer credentials required'));
    }

    const lawyer = await Lawyer.findById(payload.id).select('+passwordHash');
    if (!lawyer || lawyer.deletedAt) {
      return next(ApiError.unauthorized('Lawyer profile not found or has been deactivated.'));
    }

    if (lawyer.accountStatus === 'suspended') {
      return next(
        ApiError.forbidden(
          `Your lawyer account has been suspended. Reason: ${lawyer.statusReason || 'Administrative compliance review'}`
        )
      );
    }

    if (lawyer.accountStatus === 'inactive') {
      return next(ApiError.forbidden('Your lawyer account is inactive. Please contact support.'));
    }

    req.lawyer = lawyer;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring the lawyer is already approved and verified by admin
 */
export const requireVerifiedLawyer = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.lawyer) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.lawyer.verificationStatus !== 'verified') {
    return next(
      new ApiError(
        403,
        `Verification required: Your account verification status is currently '${req.lawyer.verificationStatus}'. Protected professional workflows are only accessible to approved lawyers.`,
        [
          {
            verificationStatus: req.lawyer.verificationStatus,
            rejectionReason: req.lawyer.rejectionReason,
            verificationNotes: req.lawyer.verificationNotes
          }
        ]
      )
    );
  }

  next();
};

