import { Request, Response, NextFunction } from "express";

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Wrap async route handlers to forward errors to Express error middleware
export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
