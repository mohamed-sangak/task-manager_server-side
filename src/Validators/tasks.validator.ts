import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../Common/enums.js';

export const listTasksQuery = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.preprocess((v) => (v ? Number(v) : undefined), z.number().int().positive().optional()),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().optional().refine((s) => !s || !Number.isNaN(Date.parse(s as string)), 'Invalid date.'),
  assigneeId: z.number().int().positive().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskParams = z.object({
  projectId: z.preprocess((v) => Number(v), z.number().int().positive()),
  taskId: z.preprocess((v) => Number(v), z.number().int().positive()).optional(),
});

export const listTasksValidator = { params: taskParams, query: listTasksQuery };
export const getTaskValidator = { params: taskParams };
export const createTaskValidator = { params: taskParams, body: createTaskSchema };
export const updateTaskValidator = { params: taskParams, body: updateTaskSchema };
export const deleteTaskValidator = { params: taskParams };
