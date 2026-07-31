import { Request, Response } from "express";
import { sendSuccess } from "../../Utils/response.js";
import { ProjectRepository, ProjectMemberRepository, UserRepository } from "../../Db/Repos";
import { badRequest, notFound, conflict } from "../../Utils/error.js";
import { ProjectUserRole } from "../../Common/enums";
import { sequelize } from "../../Db/config";

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
      const projects = await this.projectRepo.findAllAdminProjects();
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
    this.ensureNoDuplicateInitialMembers(managers, members);

    const initialUserIds = [...(Array.isArray(managers) ? managers : []), ...(Array.isArray(members) ? members : [])];
    const missingUserIds: string[] = [];
    for (const userId of initialUserIds) {
      if (!(await this.userRepo.findById(userId))) missingUserIds.push(userId);
    }
    if (missingUserIds.length > 0) {
      throw badRequest("One or more initial project members do not exist.", { userIds: missingUserIds });
    }

    const createdBy = req.user!.id;

    const project = await sequelize.transaction(async (transaction) => {
      const createdProject = await this.projectRepo.create({ name, description, createdBy } as any, transaction);

      // Add creator as manager by default.
      await this.projectMemberRepo.addMember(String(createdProject.id), createdBy, ProjectUserRole.MANAGER, transaction);

      const addList = async (ids: string[] | undefined, role: ProjectUserRole) => {
        if (!Array.isArray(ids)) return;
        for (const userId of ids) {
          const existing = await this.projectMemberRepo.findMember(String(createdProject.id), userId, transaction);
          if (existing) continue;
          await this.projectMemberRepo.addMember(String(createdProject.id), userId, role, transaction);
        }
      };

      await addList(managers, ProjectUserRole.MANAGER);
      await addList(members, ProjectUserRole.MEMBER);
      return createdProject;
    });

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

  // GET /api/projects/:projectId/available-users
  getAvailableUsers = async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const search = req.query.search as string | undefined;

    if (!projectId) throw badRequest("Invalid project ID.");

    const users = await this.projectMemberRepo.findUsersNotInProject(projectId, search);
    return sendSuccess(res, users);
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
    if (existing) throw conflict(`User is already a ${existing.role} of this project.`);

    await this.projectMemberRepo.addMember(projectId, userId, role as ProjectUserRole);
    const member = await this.projectMemberRepo.findMember(projectId, userId);
    return sendSuccess(res, member, "Member added successfully.", 201);
  };

  // PUT /api/projects/:projectId/members/:userId
  updateMemberRole = async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const userId = req.params.userId as string;
    const { role } = req.body;

    if (!projectId || !userId) throw badRequest("projectId and userId are required.");

    if (!Object.values(ProjectUserRole).includes(role)) {
      throw badRequest("Invalid project role. Must be 'manager' or 'member'.");
    }

    const membership = await this.projectMemberRepo.findMember(projectId, userId);
    if (!membership) throw notFound("User is not a member of this project.");
    if (membership.role === role) throw conflict(`User is already a ${role} of this project.`);

    if (membership.role === ProjectUserRole.MANAGER && role === ProjectUserRole.MEMBER) {
      await this.ensureProjectKeepsManager(projectId, "Cannot demote the last project manager.");
    }

    await this.projectMemberRepo.updateRole(projectId, userId, role as ProjectUserRole);

    const updated = await this.projectMemberRepo.findMember(projectId, userId);
    return sendSuccess(res, updated, "Member role updated successfully.");
  };

  // DELETE /api/projects/:projectId/members/:userId
  removeMember = async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const userId = req.params.userId as string;

    if (!projectId || !userId) throw badRequest("projectId and userId are required.");

    const membership = await this.projectMemberRepo.findMember(projectId, userId);
    if (!membership) throw notFound("User is not a member of this project.");
    if (membership.role === ProjectUserRole.MANAGER) {
      await this.ensureProjectKeepsManager(projectId, "Cannot remove the last project manager.");
    }

    await this.projectMemberRepo.removeMember(projectId, userId);
    return sendSuccess(res, null, "Member removed successfully.");
  };

  private ensureNoDuplicateInitialMembers(managers?: string[], members?: string[]) {
    const managerIds = Array.isArray(managers) ? managers : [];
    const memberIds = Array.isArray(members) ? members : [];
    const allIds = [...managerIds, ...memberIds];
    const uniqueIds = new Set(allIds);

    if (uniqueIds.size !== allIds.length) {
      throw badRequest("A user can only appear once across managers and members.");
    }
  }

  private async ensureProjectKeepsManager(projectId: string, message: string) {
    const managerCount = await this.projectMemberRepo.countManagers(projectId);

    if (managerCount <= 1) {
      throw badRequest(message);
    }
  }
}
