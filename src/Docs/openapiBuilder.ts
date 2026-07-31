import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import './zod-extend'; // ensure .openapi extension applied

// Import validators
import * as AuthValidators from '../Validators/auth.validator';
import * as ProjectValidators from '../Validators/projects.validator';
import * as TaskValidators from '../Validators/tasks.validator';
import * as UserValidators from '../Validators/users.validator';

const registry = new OpenAPIRegistry();

// Basic shared response wrappers
const SuccessWrapper = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    message: z.string().openapi({ example: 'Success' }),
    data: z.any().optional().openapi({ description: 'Response data' }),
  })
  .openapi('SuccessResponse');

const ErrorWrapper = z
  .object({
    success: z.literal(false).openapi({ example: false }),
    message: z.string().openapi({ example: 'Error' }),
    errors: z.any().optional(),
  })
  .openapi('ErrorResponse');

// Register key schemas that are referenced by responses
registry.register('SuccessResponse', SuccessWrapper);
registry.register('ErrorResponse', ErrorWrapper);

// Helper to register a path with common response wrapper
function regPath(opts: any) {
  registry.registerPath(opts);
}

// Auth endpoints
regPath({
  method: 'post',
  path: '/api/auth/register',
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: AuthValidators.registerSchema } } } },
  responses: {
    201: { description: 'Created', content: { 'application/json': { schema: SuccessWrapper } } },
    default: { description: 'Error', content: { 'application/json': { schema: ErrorWrapper } } },
  },
});

regPath({
  method: 'post',
  path: '/api/auth/login',
  summary: 'Login',
  request: { body: { content: { 'application/json': { schema: AuthValidators.loginSchema } } } },
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } },
    default: { description: 'Error', content: { 'application/json': { schema: ErrorWrapper } } },
  },
});

regPath({
  method: 'get',
  path: '/api/auth/me',
  summary: 'Get current user',
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } },
    default: { description: 'Error', content: { 'application/json': { schema: ErrorWrapper } } },
  },
});

// Projects
regPath({
  method: 'get',
  path: '/api/projects',
  summary: 'List projects for current user',
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'post',
  path: '/api/projects',
  summary: 'Create project',
  request: { body: { content: { 'application/json': { schema: ProjectValidators.createProjectSchema } } } },
  responses: { 201: { description: 'Created', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'get',
  path: '/api/projects/{projectId}',
  summary: 'Get project by id',
  request: { params: ProjectValidators.projectIdParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'put',
  path: '/api/projects/{projectId}',
  summary: 'Update project',
  request: { params: ProjectValidators.projectIdParams, body: { content: { 'application/json': { schema: ProjectValidators.updateProjectSchema } } } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'delete',
  path: '/api/projects/{projectId}',
  summary: 'Delete project',
  request: { params: ProjectValidators.projectIdParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

// Project members
regPath({
  method: 'post',
  path: '/api/projects/{projectId}/members',
  summary: 'Add member to project',
  request: { params: ProjectValidators.projectIdParams, body: { content: { 'application/json': { schema: ProjectValidators.addMemberSchema } } } },
  responses: { 201: { description: 'Created', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'delete',
  path: '/api/projects/{projectId}/members/{userId}',
  summary: 'Remove project member',
  request: { params: ProjectValidators.projectMemberParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

// Tasks
regPath({
  method: 'get',
  path: '/api/projects/{projectId}/tasks',
  summary: 'List tasks in project',
  request: { params: TaskValidators.taskParams, query: TaskValidators.listTasksQuery },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'post',
  path: '/api/projects/{projectId}/tasks',
  summary: 'Create task',
  request: { params: TaskValidators.taskParams, body: { content: { 'application/json': { schema: TaskValidators.createTaskSchema } } } },
  responses: { 201: { description: 'Created', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'get',
  path: '/api/projects/{projectId}/tasks/{taskId}',
  summary: 'Get task',
  request: { params: TaskValidators.taskParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'put',
  path: '/api/projects/{projectId}/tasks/{taskId}',
  summary: 'Update task',
  request: { params: TaskValidators.taskParams, body: { content: { 'application/json': { schema: TaskValidators.updateTaskSchema } } } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'delete',
  path: '/api/projects/{projectId}/tasks/{taskId}',
  summary: 'Delete task',
  request: { params: TaskValidators.taskParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

// Users (admin)
regPath({
  method: 'get',
  path: '/api/users',
  summary: 'List users',
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'get',
  path: '/api/users/{id}',
  summary: 'Get user by id',
  request: { params: UserValidators.userIdParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'put',
  path: '/api/users/{id}/role',
  summary: 'Update user role',
  request: { params: UserValidators.userIdParams, body: { content: { 'application/json': { schema: UserValidators.updateUserRoleSchema } } } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

regPath({
  method: 'delete',
  path: '/api/users/{id}',
  summary: 'Delete user',
  request: { params: UserValidators.userIdParams },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: SuccessWrapper } } } },
});

// Generate full document
const generator = new OpenApiGeneratorV3(registry.definitions as any);

export const openapiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: process.env.npm_package_name || 'Task Manager API',
    version: process.env.npm_package_version || '0.0.1',
    description: 'Auto-generated OpenAPI from Zod validators',
  },
  servers: [{ url: process.env.BASE_URL || 'http://localhost:5000' }],
});

// Add JWT bearer security scheme into components
openapiDocument.components = openapiDocument.components || {} as any;
(openapiDocument.components as any).securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

export default openapiDocument;
