import { NextFunction, Request, Response } from "express";
import { UserRole } from "../Common/types";
import { sendError } from "../Utils/response.js";

/**
 * Middleware factory that restricts access to the specified roles.
 * Must be used AFTER the `authenticate` middleware.
 *
 * @example
 * router.post("/", authenticate, requireRole("Admin", "Manager"), createProject);
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Not authenticated.", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role(s): ${roles.join(", ")}.`,
        403
      );
      return;
    }

    next();
  };
};
