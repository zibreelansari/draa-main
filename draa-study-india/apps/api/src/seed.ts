import { ensureDemoWorkspace, ensureUser, openDatabase } from "@draa/database";
import { config } from "./config.js";
import { hashPassword } from "./security.js";

export const demoAccounts = [
  { email: "student@demo.draa.in", role: "STUDENT" as const, name: "Demo Student", password: "Student@123" },
  { email: "institute@demo.draa.in", role: "INSTITUTE" as const, name: "Demo Institute", password: "Institute@123" },
  { email: "admin@demo.draa.in", role: "ADMIN" as const, name: "DRAA Administrator", password: "Admin@123" },
];

export async function seedDemoUsers() {
  const db = openDatabase(config.databaseFile);
  for (const account of demoAccounts) {
    ensureUser(db, account.email, account.role, account.name, await hashPassword(account.password));
  }
  ensureDemoWorkspace(db);
  db.close();
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) {
  await seedDemoUsers();
  console.log("DRAA demo users are ready.");
}
