import type { Request, Response, NextFunction } from 'express';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[API Error]', error);

  if (error instanceof Error && error.name === 'ValidationError') {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error. Please try again later.' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'API route not found.' });
}
