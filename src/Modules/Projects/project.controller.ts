import { Request, Response } from "express";
import { Project, User } from "../../Db/Models";
import { sendSuccess } from "../../Utils/response.js";
import { ProjectRepository, ProjectMemberRepository, UserRepository } from "../../Db/Repos";
import { badRequest, notFound, conflict } from "../../Utils/error.js";
import { ProjectUserRole } from "../../Common/enums";

export class ProjectController {
  constructor(
    private projectRepo: ProjectRepository,
    private projectMemberRepo: ProjectMemberRepository,
    private userRepo: UserRepository
  ) {}

  // GET /api/projects  — returns only projects the user belongs to (Admin sees all)
  getProjects = async (req: Request, res: Response) => {
    const user = req.user!;

    if (user.role === "Admin") {
      // Admin sees all projects
      const projects = await Project.findAll({
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "members", attributes: ["id", "name", "email"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return sendSuccess(res, projects);
    }

    const projects = await this.projectRepo.findProjectsByUser(user.id);
    return sendSuccess(res, projects);
  };

  // GET /api/projects/:projectId
  getProject = async (req: Request, res: Response) => {
    const id = req.params.projectId as string;
    if (!id) throw badRequest("Invalid project ID.");

    const project = await this.projectRepo.findById(id);
    if (!project) throw notFound("Project not found.");

    return sendSuccess(res, project);
  };

  // POST /api/projects  — Admin only (admin specifies initial managers/members)
  createProject = async (req: Request, res: Response) => {
    const { name, description, managers, members } = req.body;

    if (!name) throw badRequest("Project name is required.");

    const createdBy = req.user!.id;

    const project = await this.projectRepo.create({ name, description, createdBy } as any);

    // Add creator as manager by default
    await this.projectMemberRepo.addMember(String(project.id), createdBy, ProjectUserRole.MANAGER);

    // Helper to add lists
    const addList = async (ids: string[] | undefined, role: ProjectUserRole) => {
      if (!Array.isArray(ids)) return;
      for (const uid of ids) {
        const target = await this.userRepo.findById(uid);
        if (!target) continue; // skip nonexistent users

        const existing = await this.projectMemberRepo.findMember(String(project.id), uid);
        if (existing) continue;

        await this.projectMemberRepo.addMember(String(project.id), uid, role);
      }
    };

    await addList(managers, ProjectUserRole.MANAGER);
    await addList(members, ProjectUserRole.MEMBER);

    const full = await this.projectRepo.findById(String(project.id));
    return sendSuccess(res, full, "Project created successfully.", 201);
  };

  // PUT /api/projects/:projectId
  updateProject = async (req: Request, res: Response) => {
    const id = req.params.projectId as string;
    if (!id) throw badRequest("Invalid project ID.");

    const { name, description } = req.body;
    await this.projectRepo.update(id, { name, description } as any);
    const updated = await this.projectRepo.findById(id);
    return sendSuccess(res, updated, "Project updated successfully.");
  };

  // DELETE /api/projects/:projectId
  deleteProject = async (req: Request, res: Response) => {
    const id = req.params.projectId as string;
    if (!id) throw badRequest("Invalid project ID.");

    const exists = await this.projectRepo.findById(id);
    if (!exists) throw notFound("Project not found.");

    await this.projectRepo.delete(id);
    return sendSuccess(res, null, "Project deleted successfully.");
  };

  // POST /api/projects/:projectId/members
  addMember = async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const { userId, role } = req.body;

    if (!projectId || !userId) throw badRequest("projectId and userId are required.");

    if (!Object.values(ProjectUserRole).includes(role)) {
      throw badRequest("Invalid project role. Must be 'manager' or 'member'.");
    }

    const targetUser = await this.userRepo.findById(userId);
    if (!targetUser) throw notFound("User not found.");

    const existing = await this.projectMemberRepo.findMember(projectId, userId);
    if (existing) throw conflict("User is already a member of this project.");

    const member = await this.projectMemberRepo.addMember(projectId, userId, role as ProjectUserRole);
    return sendSuccess(res, member, "Member added successfully.", 201);
  };

  // DELETE /api/projects/:projectId/members/:userId
  removeMember = async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const userId = req.params.userId as string;

    if (!projectId || !userId) throw badRequest("projectId and userId are required.");

    const membership = await this.projectMemberRepo.findMember(projectId, userId);
    if (!membership) throw notFound("User is not a member of this project.");

    await this.projectMemberRepo.removeMember(projectId, userId);
    return sendSuccess(res, null, "Member removed successfully.");
  };
}
