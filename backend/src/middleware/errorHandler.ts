import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'An unexpected internal server error occurred';
  let errors: any[] | undefined = undefined;

  // Custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Mongoose Invalid ObjectId CastError
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
  }
  // Mongoose Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `A record with this ${field} (${value}) already exists`;
  }
  // Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }
  // JSON parse error in body
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }
  // Fallback
  else {
    if (env.NODE_ENV !== 'production') {
      console.error('[Unhandled Error]', err);
    }
  }

  // Only expose details in non-production
  if (env.NODE_ENV === 'development' && statusCode === 500 && !errors) {
    errors = [{ error: err.message, stack: err.stack }];
  }

  return sendError(res, statusCode, message, errors);
};

