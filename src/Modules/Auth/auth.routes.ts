import { Router } from "express";
import { authenticate } from "../../Middlewares/authMiddleware";
import { UserRepository } from "../../Db/Repos";
import { AuthController } from "./auth.controller";

const router = Router();


const userRepo = new UserRepository();
const authController = new AuthController(userRepo);

import { asyncHandler } from "../../Utils/asyncHandler.js";

// POST /api/auth/register
router.post("/register", asyncHandler(authController.register));

// POST /api/auth/login
router.post("/login", asyncHandler(authController.login));

// GET /api/auth/me  (protected)
router.get("/me", authenticate, asyncHandler(authController.getMe));

export default router;
