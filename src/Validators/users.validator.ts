import { z } from 'zod';

export const userIdParams = z.object({
  id: z.string().uuid(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['Admin', 'User']),
});

export const getUserValidator = { params: userIdParams };
export const updateUserRoleValidator = { params: userIdParams, body: updateUserRoleSchema };
export const deleteUserValidator = { params: userIdParams };
