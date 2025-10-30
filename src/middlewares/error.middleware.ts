import { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
  status?: number;
  errors?: unknown;
}

interface ExpressHandler<T extends Error> {
  (err: T, req: Request, res: Response, next: NextFunction): void;
}

export const errorHandlerMiddleware: ExpressHandler<CustomError> = (err, _req, res, _next) => {
  // format error
  res.status(err.status ?? 500).json({
    message: err.message,
    errors: err.errors,
  });
};
