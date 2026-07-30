import "dotenv/config";
import bcrypt from "bcrypt";
import { withTransaction } from "./helpers";
import { User } from "../src/Db/Models";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

export default async function seedUsers() {
  return withTransaction(async (t) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || "admin@company.com";
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || "Password123";

    const [admin] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: process.env.TEST_ADMIN_NAME || "Site Administrator",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, SALT_ROUNDS),
        role: "Admin",
      },
      transaction: t,
    });

    // Create a few Arabic names written in English (transliterated)
    const demoUsers = [
      { name: "Ahmad Ali", email: process.env.SEED_USER1_EMAIL || "ahmad.ali@company.com" },
      { name: "Sara Mohamed", email: process.env.SEED_USER2_EMAIL || "sara.mohamed@company.com" },
      { name: "Khaled Hassan", email: process.env.SEED_USER3_EMAIL || "khaled.hassan@company.com" },
    ];

    for (const u of demoUsers) {
      await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          name: u.name,
          email: u.email,
          passwordHash: await bcrypt.hash("UserPass123", SALT_ROUNDS),
          role: "User",
        },
        transaction: t,
      });
    }

    console.log("Users seeded (admin + users). Admin:", adminEmail);
    return true;
  });
}
