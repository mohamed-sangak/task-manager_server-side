import { NextFunction, Request, Response } from "express";
import { ProjectMember } from "../Db/Models";
import { badRequest, forbidden, internal } from "../Utils/error.js";

/**
 * Verifies the authenticated user is a member of the project
 * referenced by `req.params.projectId`.
 *
 * Admins bypass this check and always have access.
 * Must be used AFTER the `authenticate` middleware.
 */
export const requireProjectAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    // Admins have unrestricted access
    if (user.role === "Admin") {
      next();
      return;
    }

    const projectId = req.params.projectId as string;
    if (!projectId) {
      return next(badRequest("Invalid project ID."));
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: user.id },
    });

    if (!membership) {
      return next(forbidden("You are not a member of this project."));
    }

    next();
  } catch (err) {
    return next(internal("Failed to verify project access.", err));
  }
};
