import { withTransaction } from "./helpers";
import { Project, User, ProjectMember } from "../src/Db/Models";
import { ProjectUserRole } from "../src/Common/enums";

export default async function seedProjectMembers() {
  return withTransaction(async (t) => {
    // Assign members across all projects
    const admin = await User.findOne({ where: { email: process.env.TEST_ADMIN_EMAIL || "admin@company.com" }, transaction: t });
    const ahmad = await User.findOne({ where: { email: process.env.SEED_USER1_EMAIL || "ahmad.ali@company.com" }, transaction: t });
    const sara = await User.findOne({ where: { email: process.env.SEED_USER2_EMAIL || "sara.mohamed@company.com" }, transaction: t });
    const khaled = await User.findOne({ where: { email: process.env.SEED_USER3_EMAIL || "khaled.hassan@company.com" }, transaction: t });

    if (!admin || !ahmad || !sara || !khaled) throw new Error("Some users are missing. Run users seeder first.");

    const allProjects = await Project.findAll({ transaction: t });

    for (const project of allProjects) {
      // For each project, make admin a manager
      await ProjectMember.findOrCreate({ where: { projectId: project.id, userId: admin.id }, defaults: { role: ProjectUserRole.MANAGER }, transaction: t });
    }

    // Assign specific roles for variety
    const firstProject = allProjects[0];
    if (firstProject) {
      await ProjectMember.findOrCreate({ where: { projectId: firstProject.id, userId: ahmad.id }, defaults: { role: ProjectUserRole.MANAGER }, transaction: t });
      await ProjectMember.findOrCreate({ where: { projectId: firstProject.id, userId: sara.id }, defaults: { role: ProjectUserRole.MEMBER }, transaction: t });
    }

    const secondProject = allProjects[1];
    if (secondProject) {
      await ProjectMember.findOrCreate({ where: { projectId: secondProject.id, userId: sara.id }, defaults: { role: ProjectUserRole.MANAGER }, transaction: t });
      await ProjectMember.findOrCreate({ where: { projectId: secondProject.id, userId: khaled.id }, defaults: { role: ProjectUserRole.MEMBER }, transaction: t });
    }

    const thirdProject = allProjects[2];
    if (thirdProject) {
      await ProjectMember.findOrCreate({ where: { projectId: thirdProject.id, userId: khaled.id }, defaults: { role: ProjectUserRole.MANAGER }, transaction: t });
      await ProjectMember.findOrCreate({ where: { projectId: thirdProject.id, userId: ahmad.id }, defaults: { role: ProjectUserRole.MEMBER }, transaction: t });
    }

    console.log("Project members seeded for projects.");
    return true;
  });
}
