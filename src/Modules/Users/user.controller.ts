import { Request, Response } from "express";
import { UserRepository } from "../../Db/Repos";
import { sendSuccess } from "../../Utils/response.js";
import { badRequest, notFound } from "../../Utils/error.js";
import { UserRole } from "../../Common/types";

export class UserController {
  constructor(private userRepo: UserRepository) {}

  // GET /api/users  — Admin only
  getAllUsers = async (_req: Request, res: Response) => {
    const users = await this.userRepo.findAll();
    return sendSuccess(res, users);
  };

  // GET /api/users/:id  — Admin only
  getUserById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw badRequest("Invalid user ID.");

    const user = await this.userRepo.findById(id);
    if (!user) throw notFound("User not found.");

    return sendSuccess(res, user);
  };

  // PUT /api/users/:id/role  — Admin only
  updateUserRole = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { role } = req.body;
    const allowedRoles: UserRole[] = ["Admin", "User"];

    if (!id) throw badRequest("Invalid user ID.");
    if (!role || !allowedRoles.includes(role)) throw badRequest(`Role must be one of: ${allowedRoles.join(", ")}.`);

    const exists = await this.userRepo.findById(id);
    if (!exists) throw notFound("User not found.");

    await this.userRepo.update(id, { role } as any);
    return sendSuccess(res, { id, role }, "Role updated.");
  };

  // DELETE /api/users/:id  — Admin only
  deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw badRequest("Invalid user ID.");

    const user = await this.userRepo.findById(id);
    if (!user) throw notFound("User not found.");

    // Prevent admin from deleting themselves
    if (id === req.user!.id) throw badRequest("You cannot delete your own account.");

    await this.userRepo.delete(id);
    return sendSuccess(res, null, "User deleted successfully.");
  };
}
