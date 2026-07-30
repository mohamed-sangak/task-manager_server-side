export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code = "internal_error", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const badRequest = (message = "Bad Request", details?: unknown) => new AppError(message, 400, "bad_request", details);
export const unauthorized = (message = "Unauthorized", details?: unknown) => new AppError(message, 401, "unauthorized", details);
export const forbidden = (message = "Forbidden", details?: unknown) => new AppError(message, 403, "forbidden", details);
export const notFound = (message = "Not Found", details?: unknown) => new AppError(message, 404, "not_found", details);
export const conflict = (message = "Conflict", details?: unknown) => new AppError(message, 409, "conflict", details);
export const internal = (message = "Internal Server Error", details?: unknown) => new AppError(message, 500, "internal_server_error", details);

export const isAppError = (err: unknown): err is AppError => {
  return !!err && typeof err === 'object' && 'statusCode' in err && 'code' in err;
};
