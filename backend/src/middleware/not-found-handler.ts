import { Request, Response } from 'express';
import { ApiError } from '../models/types';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiError = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  res.status(404).json(response);
}
