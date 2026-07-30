import { z } from 'zod';
import { ProjectUserRole } from '../Common/enums.js';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional(),
  managers: z.array(z.number().int().positive()).optional(),
  members: z.array(z.number().int().positive()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.nativeEnum(ProjectUserRole),
});

export const projectIdParams = z.object({
  projectId: z.preprocess((v) => Number(v), z.number().int().positive()),
});

export const projectMemberParams = z.object({
  projectId: z.preprocess((v) => Number(v), z.number().int().positive()),
  userId: z.preprocess((v) => Number(v), z.number().int().positive()),
});

export const createProjectValidator = { body: createProjectSchema };
export const updateProjectValidator = { params: projectIdParams, body: updateProjectSchema };
export const getProjectValidator = { params: projectIdParams };
export const deleteProjectValidator = { params: projectIdParams };
export const addMemberValidator = { params: projectIdParams, body: addMemberSchema };
export const removeMemberValidator = { params: projectMemberParams };
