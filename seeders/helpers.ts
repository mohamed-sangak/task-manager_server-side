import { sequelize } from "../src/Db/config";
import { Transaction } from "sequelize";

export async function withTransaction<T>(fn: (t: Transaction) => Promise<T>) {
  const t = await sequelize.transaction();
  try {
    const res = await fn(t);
    await t.commit();
    return res;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

// guardRun intentionally left as a no-op to allow explicit script invocation
// Seeding now depends only on running the seed script.
export function guardRun() {
  // no-op by design
  return;
}
