import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message =
    status === 500
      ? 'Something exploded on our end. Our hamsters are working on it. 🐹'
      : err.message;

  console.error(`[ERROR ${status}]`, err.message);

  res.status(status).json({ message });
}

export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
}
