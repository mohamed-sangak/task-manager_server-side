import { NextFunction, Request, Response } from 'express';
import { ProjectMember } from '../Db/Models';
import { badRequest, forbidden, internal } from '../Utils/error.js';

/**
 * Allows access if the user is Admin (global) or a project-level manager for req.params.projectId.
 */
export const requireProjectManagerOrAdmin = async (
  req: Request,
  _res: Response,
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
      return next(badRequest('Invalid project ID.'));
    }

    const membership = await ProjectMember.findOne({ where: { projectId, userId: user.id } });
    if (!membership || (membership as any).role !== 'manager') {
      return next(forbidden('Requires project manager role.'));
    }

    next();
  } catch (err) {
    return next(internal('Failed to verify project manager permission.', err));
  }
};
