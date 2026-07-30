import { Router } from "express";
import { authenticate } from "../../Middlewares/authMiddleware.js";
import { requireProjectAccess } from "../../Middlewares/projectAccessMiddleware.js";
import { requireRole } from "../../Middlewares/roleMiddleware.js";
import { requireProjectManagerOrAdmin } from "../../Middlewares/projectRoleMiddleware.js";
import { ProjectRepository, ProjectMemberRepository, UserRepository } from "../../Db/Repos";
import { ProjectController } from "./project.controller";

const router = Router();

const projectRepo = new ProjectRepository();
const projectMemberRepo = new ProjectMemberRepository();
const userRepo = new UserRepository();
const projectController = new ProjectController(projectRepo, projectMemberRepo, userRepo);

import { asyncHandler } from "../../Utils/asyncHandler.js";

// All project routes require authentication
router.use(authenticate);

import { validate } from "../../Validators/validate.js";
import {
  createProjectValidator,
  updateProjectValidator,
  getProjectValidator,
  deleteProjectValidator,
  addMemberValidator,
  removeMemberValidator,
} from "../../Validators/projects.validator.js";

// GET /api/projects  — any authenticated user (scoped by membership)
router.get("/", asyncHandler(projectController.getProjects));

// POST /api/projects  — Admin only
router.post(
  "/",
  requireRole("Admin"),
  validate(createProjectValidator),
  asyncHandler(projectController.createProject)
);

// Routes below require project membership (or Admin)
router.get("/:projectId", requireProjectAccess, validate(getProjectValidator), asyncHandler(projectController.getProject));

router.put(
  "/:projectId",
  requireProjectAccess,
  requireProjectManagerOrAdmin,
  validate(updateProjectValidator),
  asyncHandler(projectController.updateProject)
);
router.delete(
  "/:projectId",
  requireProjectAccess,
  requireProjectManagerOrAdmin,
  validate(deleteProjectValidator),
  asyncHandler(projectController.deleteProject)
);

// Member management — Admin or Project Manager only
router.post(
  "/:projectId/members",
  requireProjectAccess,
  requireProjectManagerOrAdmin,
  validate(addMemberValidator),
  asyncHandler(projectController.addMember)
);
router.delete(
  "/:projectId/members/:userId",
  requireProjectAccess,
  requireProjectManagerOrAdmin,
  validate(removeMemberValidator),
  asyncHandler(projectController.removeMember)
);

export default router;
