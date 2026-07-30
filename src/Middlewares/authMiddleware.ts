import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../Utils/jwt.js";
import { unauthorized } from "../Utils/error.js";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw unauthorized("No token provided. Please log in.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    throw unauthorized("Invalid or expired token. Please log in again.");
  }
};
