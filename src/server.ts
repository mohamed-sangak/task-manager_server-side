import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from 'swagger-ui-express';

import authRoutes from "./Modules/Auth/auth.routes.js";
import projectRoutes from "./Modules/Projects/project.routes.js";
import taskRoutes from "./Modules/Tasks/task.routes.js";
import userRoutes from "./Modules/Users/user.routes.js";

import { DBconnect } from "./Db/dbconnect.js";
import { errorHandler } from "./Middlewares/errorHandler.js";
import openapiDocument from './Docs/openapiBuilder';

const app = express();
const allowedCorsOrigin = process.env.CORS_ORIGIN;

app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!allowedCorsOrigin || allowedCorsOrigin === "*" || !origin || origin === allowedCorsOrigin) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS."));
    },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,               // 100 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", limiter);

// Routes 
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.get('/openapi.json', (_req, res) => res.json(openapiDocument));

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
    console.log(`Docs available at http://localhost:${PORT}/docs`);
});
