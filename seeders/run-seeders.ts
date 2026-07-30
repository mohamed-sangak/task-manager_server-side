import "dotenv/config";
import { DBconnect } from "../src/Db/dbconnect";

import seedUsers from "./001-users.seed";
import seedProjects from "./002-projects.seed";
import seedProjectMembers from "./003-project-members.seed";
import seedTasks from "./004-tasks.seed";

async function run() {
  try {
    // Ensure DB connection
    await DBconnect();

    console.log("Starting seeders...");

    await seedUsers();
    await seedProjects();
    await seedProjectMembers();
    await seedTasks();

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

run();
