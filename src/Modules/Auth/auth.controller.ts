import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { UserRole } from "../../Common/types";
import { UserRepository } from "../../Db/Repos";
import { badRequest, conflict, notFound, unauthorized } from "../../Utils/error.js";
import { signToken } from "../../Utils/jwt.js";
import { sendSuccess } from "../../Utils/response.js";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

export class AuthController {
  constructor(private userRepo: UserRepository) { }

  register = async (req: Request, res: Response)=> {
    const { name, email, password } = req.body; // role not accepted from client

    if (!name || !email || !password) {
      throw badRequest("Name, email, and password are required.");
    }

    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw conflict("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // New users always get the 'User' global role
    const user = await this.userRepo.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: "User",
    });

    const role = (user.role || "User") as UserRole;
    const token = signToken({ id: user.id, email: user.email, role });

    return sendSuccess(
      res,
      {
        token,
        user: { id: user.id, name: user.name, email: user.email, role },
      },
      "Account created successfully.",
      201
    );
  };

  // POST /api/auth/login
  login = async (req: Request, res: Response)=> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw badRequest("Email and password are required.");
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw unauthorized("Invalid credentials.");
    }

    const pwdHash = user.passwordHash;
    const isMatch = await bcrypt.compare(password, pwdHash);
    if (!isMatch) {
      throw unauthorized("Invalid credentials.");
    }

    const role = user.role as UserRole;
    const token = signToken({ id: user.id, email: user.email, role });

    return sendSuccess(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role },
    });
  };

  // GET /api/auth/me  (protected)
  getMe = async (req: Request, res: Response)=> {
    const user = await this.userRepo.findById(req.user!.id);

    if (!user) {
      throw notFound("User not found.");
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };

    return sendSuccess(res, safeUser);
  };
}
