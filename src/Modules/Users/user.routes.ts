import { Router } from "express";
import { authenticate } from "../../Middlewares/authMiddleware.js";
import { requireRole } from "../../Middlewares/roleMiddleware.js";
import { UserRepository } from "../../Db/Repos";
import { UserController } from "./user.controller";

const router = Router();

const userRepo = new UserRepository();
const userController = new UserController(userRepo);

import { asyncHandler } from "../../Utils/asyncHandler.js";

// All user management routes: Admin only
router.use(authenticate, requireRole("Admin"));

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.put("/:id/role", asyncHandler(userController.updateUserRole));
router.delete("/:id", asyncHandler(userController.deleteUser));

export default router;
