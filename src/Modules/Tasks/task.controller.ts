import { Request, Response } from "express";
import { TaskRepository, ProjectMemberRepository } from "../../Db/Repos";
import { UserRepository } from "../../Db/Repos";
import { sendSuccess } from "../../Utils/response.js";
import { badRequest, notFound, forbidden } from "../../Utils/error.js";
import { ProjectUserRole } from "../../Common/enums";

export class TaskController {
  constructor(
    private taskRepo: TaskRepository,
    private userRepo: UserRepository,
    private projectMemberRepo: ProjectMemberRepository
  ) {}

  // GET /api/projects/:projectId/tasks
  getTasks = async (req: Request, res: Response)=> {
    const projectId = req.params.projectId as string;
    if (!projectId) throw badRequest("Invalid project ID.");

    const { status, priority, assigneeId } = req.query as any;
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assigneeId) filters.assigneeId = assigneeId;

    const tasks = await this.taskRepo.findTasksByProject(projectId, filters);
    return sendSuccess(res, tasks);
  };

  // GET /api/projects/:projectId/tasks/:taskId
  getTask = async (req: Request, res: Response)=> {
    const taskId = req.params.taskId as string;
    if (!taskId) throw badRequest("Invalid task ID.");

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.projectId !== req.params.projectId) throw notFound("Task not found.");

    return sendSuccess(res, task);
  };

  // POST /api/projects/:projectId/tasks
  createTask = async (req: Request, res: Response)=> {
    const projectId = req.params.projectId as string;
    if (!projectId) throw badRequest("Invalid project ID.");

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    if (!title) throw badRequest("Task title is required.");

    const task = await this.taskRepo.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      projectId,
      createdBy: req.user!.id,
      assigneeId: assigneeId || null,
    } as any);

    const full = await this.taskRepo.findById(task.id);
    return sendSuccess(res, full, "Task created successfully.", 201);
  };

  // PUT /api/projects/:projectId/tasks/:taskId
  updateTask = async (req: Request, res: Response)=> {
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;
    if (!projectId || !taskId) throw badRequest("Invalid IDs.");

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.projectId !== projectId) throw notFound("Task not found.");

    const user = req.user!;

    // permission: Admin or project manager or task creator
    if (user.role !== "Admin") {
      const membership = await this.projectMemberRepo.findMember(projectId, user.id);
      const isManager = membership && (membership as any).role === ProjectUserRole.MANAGER;
      if (!isManager && task.createdBy !== user.id) {
        throw forbidden("You do not have permission to update this task.");
      }
    }

    await this.taskRepo.update(taskId, req.body as any);
    const updated = await this.taskRepo.findById(taskId);
    return sendSuccess(res, updated, "Task updated successfully.");
  };

  // DELETE /api/projects/:projectId/tasks/:taskId
  deleteTask = async (req: Request, res: Response)=> {
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;
    if (!projectId || !taskId) throw badRequest("Invalid IDs.");

    const task = await this.taskRepo.findById(taskId);
    if (!task || task.projectId !== projectId) throw notFound("Task not found.");

    const user = req.user!;
    if (user.role !== "Admin") {
      const membership = await this.projectMemberRepo.findMember(projectId, user.id);
      const isManager = membership && (membership as any).role === ProjectUserRole.MANAGER;
      if (!isManager && task.createdBy !== user.id) {
        throw forbidden("You do not have permission to delete this task.");
      }
    }

    await this.taskRepo.delete(taskId);
    return sendSuccess(res, null, "Task deleted successfully.");
  };
}
