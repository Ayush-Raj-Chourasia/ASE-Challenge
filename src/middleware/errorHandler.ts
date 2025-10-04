// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './validation';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function createApiError(message: string, statusCode: number = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function notFoundError(resource: string = 'Resource'): ApiError {
  return createApiError(`${resource} not found`, 404, 'NOT_FOUND');
}

export function badRequestError(message: string): ApiError {
  return createApiError(message, 400, 'BAD_REQUEST');
}

export function internalServerError(message: string = 'Internal server error'): ApiError {
  return createApiError(message, 500, 'INTERNAL_SERVER_ERROR');
}

// Global error handling middleware
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`, {
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    stack: error.stack
  });

  // Don't expose stack traces in production
  const response: ValidationError = {
    error: message,
    code,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  res.status(statusCode).json(response);
}

// 404 handler for undefined routes
export function notFoundHandler(req: Request, res: Response): void {
  const error = notFoundError(`Route ${req.method} ${req.path}`);
  res.status(404).json({
    error: error.message,
    code: error.code,
    details: `The requested route ${req.method} ${req.path} does not exist`
  });
}
