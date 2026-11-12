import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: any[];
}

export const sendSuccess = <T>(
  res: Response,
  statusCode = 200,
  message?: string,
  data?: T,
  pagination?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode = 500,
  message = 'An error occurred',
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

