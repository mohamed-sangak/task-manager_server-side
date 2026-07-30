import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Project, ProjectMember, Task, TaskComment, User } from './Models';

const poolMax = Number(process.env.DB_POOL_MAX) || 10;
const poolMin = Number(process.env.DB_POOL_MIN) || 0;
const poolAcquire = Number(process.env.DB_POOL_ACQUIRE) || 30000;
const poolIdle = Number(process.env.DB_POOL_IDLE) || 10000;

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'task_management_db',
  logging: process.env.DB_LOG === 'true' ? console.log : false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    underscored: true, // maps JS camelCase to DB snake_case
  },
  pool: {
    max: poolMax,
    min: poolMin,
    acquire: poolAcquire,
    idle: poolIdle,
  },
  dialectOptions: {
    // Add options here if needed (e.g., ssl)
  },
  timezone: '+00:00',
  models: [User, Project, ProjectMember, Task, TaskComment],
});
