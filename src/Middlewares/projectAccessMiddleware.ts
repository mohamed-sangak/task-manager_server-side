import { NextFunction, Request, Response } from "express";
import { ProjectMember } from "../Db/Models";
import { sendError } from "../Utils/response.js";

/**
 * Verifies the authenticated user is a member of the project
 * referenced by `req.params.projectId`.
 *
 * Admins bypass this check and always have access.
 * Must be used AFTER the `authenticate` middleware.
 */
export const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    // Admins have unrestricted access
    if (user.role === "Admin") {
      next();
      return;
    }

    const projectId = Number(req.params.projectId);
    if (!projectId) {
      sendError(res, "Invalid project ID.", 400);
      return;
    }

    const membership = await ProjectMember.findOne({
      where: { projectId, userId: user.id },
    });

    if (!membership) {
      sendError(res, "You are not a member of this project.", 403);
      return;
    }

    next();
  } catch (err) {
    sendError(res, "Failed to verify project access.", 500, err);
  }
};
