import { config as loadEnvironment } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
loadEnvironment({ path: resolve(workspaceRoot, ".env"), quiet: true });

const configuredDatabaseFile = process.env.DATABASE_FILE;

export const config = {
  port: Number(process.env.PORT || 5176),
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5175",
  databaseFile: configuredDatabaseFile
    ? resolve(workspaceRoot, configuredDatabaseFile)
    : resolve(workspaceRoot, "data/draa-study-india.db"),
  secureCookie: process.env.SESSION_COOKIE_SECURE === "true",
  seedDemo: process.env.DEV_SEED !== "false",
  sessionDays: 7,
};
