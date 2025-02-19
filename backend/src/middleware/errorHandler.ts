import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { APIError, ScanError } from '../types/errors';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  if (err instanceof ScanError) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
