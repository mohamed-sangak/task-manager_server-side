import { withTransaction } from "./helpers";
import { Project, User } from "../src/Db/Models";

export default async function seedProjects() {
  return withTransaction(async (t) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || "admin@company.com";
    const admin = await User.findOne({ where: { email: adminEmail }, transaction: t });
    if (!admin) throw new Error("Admin user not found — run users seeder first.");

    const projects = [
          { name: "Company Website", description: "Full redesign and content refresh of the corporate website" },
          { name: "Mobile App", description: "Mobile application for task management and notifications" },
          { name: "Content Management System", description: "Internal CMS for editorial workflow and publishing" },
    ];

    for (const p of projects) {
      await Project.findOrCreate({
        where: { name: p.name },
        defaults: { name: p.name, description: p.description, createdBy: admin.id },
        transaction: t,
      });
    }

    console.log("Projects seeded:", projects.map((p) => p.name).join(", "));
    return true;
  });
}
