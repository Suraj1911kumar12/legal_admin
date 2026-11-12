import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Customer } from '../modules/customers/customer.model';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export interface CustomerTokenPayload {
  id: string;
  email: string;
  role: 'customer';
}

export const authenticateCustomer = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.customer_access_token) {
      token = req.cookies.customer_access_token;
    } else if (req.signedCookies && req.signedCookies.customer_access_token) {
      token = req.signedCookies.customer_access_token;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in to continue.'));
    }

    let payload: CustomerTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as CustomerTokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Access token has expired.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    if (payload.role !== 'customer') {
      return next(ApiError.forbidden('Access denied: Customer credentials required.'));
    }

    const customer = await Customer.findById(payload.id);
    if (!customer || customer.accountStatus === 'deleted') {
      return next(ApiError.unauthorized('Customer account not found or has been deactivated.'));
    }

    if (customer.accountStatus === 'suspended') {
      return next(ApiError.forbidden('Your account is currently suspended. Please contact support.'));
    }

    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};
