import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
const audioDir = path.join(dataDir, "audio");
const dbPath = path.join(dataDir, "app.db");

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export { schema };
export { dataDir, audioDir };
