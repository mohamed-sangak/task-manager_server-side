import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Basic AppError shape guard
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

// Centralized error-handling middleware
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  
  
  // Normalize error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Request Validation failed.",
        code: "validation_error",
        details: err.flatten(),
      },
    });
  }

  const error = err as AppError;

  // Default values
  const statusCode = error?.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const code = error?.code || (statusCode === 500 ? "internal_error" : "error");
  const message = error?.message || "An unexpected server error occurred.";

  // Log details for debugging (can be replaced with a logger)
  console.error(`[Error] ${req.method} ${req.originalUrl} -> ${statusCode} ${code}: ${message}`);

  if ((error as any)?.stack) console.error((error as any).stack);
  
  if ((error as any)?.details) console.error("Details:", (error as any).details);

  // Send sanitized response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      // include details only for non-sensitive debugging when explicitly provided
      details: (error as any)?.details || undefined,
    },
  });
}
