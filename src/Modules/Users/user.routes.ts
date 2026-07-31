import { Router } from "express";
import { authenticate } from "../../Middlewares/authMiddleware.js";
import { requireRole } from "../../Middlewares/roleMiddleware.js";
import { UserRepository } from "../../Db/Repos";
import { UserController } from "./user.controller";
import { asyncHandler } from "../../Utils/asyncHandler.js";
import validate  from "express-zod-safe";
import { getUserValidator, updateUserRoleValidator, deleteUserValidator } from "../../Validators/users.validator.js";

const router = Router();

const userRepo = new UserRepository();
const userController = new UserController(userRepo);


// All user management routes: Admin only
router.use(authenticate, requireRole("Admin"));

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", validate(getUserValidator), asyncHandler(userController.getUserById));
router.put("/:id/role", validate(updateUserRoleValidator), asyncHandler(userController.updateUserRole));
router.delete("/:id", validate(deleteUserValidator), asyncHandler(userController.deleteUser));

export default router;
