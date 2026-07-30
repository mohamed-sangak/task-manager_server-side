import { Router } from "express";
import { authenticate } from "../../Middlewares/authMiddleware.js";
import { requireProjectAccess } from "../../Middlewares/projectAccessMiddleware.js";
import { TaskRepository, UserRepository, ProjectMemberRepository } from "../../Db/Repos";
import { TaskController } from "./task.controller";

// Tasks are nested under /api/projects/:projectId/tasks
// mergeParams: true is required for access to :projectId from the parent router
const router = Router({ mergeParams: true });

const taskRepo = new TaskRepository();
const userRepo = new UserRepository();
const projectMemberRepo = new ProjectMemberRepository();
const taskController = new TaskController(taskRepo, userRepo, projectMemberRepo);

import { asyncHandler } from "../../Utils/asyncHandler.js";

// All task routes: authenticate + verify project membership
router.use(authenticate, requireProjectAccess);

router.get("/", asyncHandler(taskController.getTasks));
router.get("/:taskId", asyncHandler(taskController.getTask));
router.post("/", asyncHandler(taskController.createTask));
router.put("/:taskId", asyncHandler(taskController.updateTask));
router.delete("/:taskId", asyncHandler(taskController.deleteTask));

export default router;
