import { NextFunction, Request, Response } from 'express';
import { ProjectMember } from '../Db/Models';
import { sendError } from '../Utils/response.js';

/**
 * Allows access if the user is Admin (global) or a project-level manager for req.params.projectId.
 */
export const requireProjectManagerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    if (user.role === 'Admin') {
      next();
      return;
    }

    const projectId = Number(req.params.projectId);
    if (!projectId) {
      sendError(res, 'Invalid project ID.', 400);
      return;
    }

    const membership = await ProjectMember.findOne({ where: { projectId, userId: user.id } });
    if (!membership || (membership as any).role !== 'manager') {
      sendError(res, 'Requires project manager role.', 403);
      return;
    }

    next();
  } catch (err) {
    sendError(res, 'Failed to verify project manager permission.', 500, err);
  }
};
