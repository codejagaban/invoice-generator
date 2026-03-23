/**
 * Usage:
 *   node --env-file=.env.local scripts/migrate.mjs          # dev
 *   node --env-file=.env.production scripts/migrate.mjs     # prod
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "../app/lib/schema.sql"), "utf8");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

console.log("Running migration...");

// Split on semicolons and run each statement
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  await sql.query(statement);
}

console.log("Migration complete.");
