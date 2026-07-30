import { NextFunction, Request, Response } from "express";
import { UserRole } from "../Common/types";
import { unauthorized, forbidden } from "../Utils/error.js";

/**
 * Middleware factory that restricts access to the specified roles.
 * Must be used AFTER the `authenticate` middleware.
 *
 * @example
 * router.post("/", authenticate, requireRole("Admin", "Manager"), createProject);
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorized("Not authenticated.");
    }

    if (!roles.includes(req.user.role)) {
      throw forbidden(`Access denied. Required role(s): ${roles.join(", ")}.`);
    }

    next();
  };
};
