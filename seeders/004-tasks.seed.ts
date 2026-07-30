import { withTransaction } from "./helpers";
import { Project, Task, User } from "../src/Db/Models";
import { TaskPriority, TaskStatus } from "../src/Common/enums";

export default async function seedTasks() {
  return withTransaction(async (t) => {
    const projects = await Project.findAll({ transaction: t });
    const admin = await User.findOne({ where: { email: process.env.TEST_ADMIN_EMAIL || "admin@company.com" }, transaction: t });
    const ahmad = await User.findOne({ where: { email: process.env.SEED_USER1_EMAIL || "ahmad.ali@company.com" }, transaction: t });
    const sara = await User.findOne({ where: { email: process.env.SEED_USER2_EMAIL || "sara.mohamed@company.com" }, transaction: t });
    const khaled = await User.findOne({ where: { email: process.env.SEED_USER3_EMAIL || "khaled.hassan@company.com" }, transaction: t });

    if (!admin) throw new Error("Admin user not found.");

    const taskTemplates = [
          { title: "Design homepage", description: "Create homepage mockups and finalize visual style", status: TaskStatus.TODO, priority: TaskPriority.HIGH },
          { title: "Database setup", description: "Create tables and indexes required for the application", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
          { title: "Write content", description: "Prepare copy for the site pages and marketing materials", status: TaskStatus.TODO, priority: TaskPriority.LOW },
    ];

    for (const project of projects) {
      for (let i = 0; i < taskTemplates.length; i++) {
        const tpl = taskTemplates[i];
        const assignee = i === 0 ? ahmad : i === 1 ? sara : khaled;
        // Use title scoped to project for uniqueness while keeping the title clean
        await Task.findOrCreate({
          where: { title: tpl.title, projectId: project.id },
          defaults: {
            title: tpl.title,
            description: tpl.description,
            status: tpl.status,
            priority: tpl.priority,
            dueDate: null,
            projectId: project.id,
            createdBy: admin.id,
            assigneeId: assignee ? assignee.id : null,
          },
          transaction: t,
        });
      }
    }

    console.log("Tasks seeded for projects.");
    return true;
  });
}
