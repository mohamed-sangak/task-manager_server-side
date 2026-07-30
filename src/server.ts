import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./Modules/Auth/auth.routes.js";
import projectRoutes from "./Modules/Projects/project.routes.js";
import taskRoutes from "./Modules/Tasks/task.routes.js";
import userRoutes from "./Modules/Users/user.routes.js";

import { DBconnect } from "./Db/dbconnect.js";
import { errorHandler } from "./Middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

// Centralized error handler
app.use(errorHandler);

await DBconnect();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
