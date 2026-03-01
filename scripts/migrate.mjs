/**
 * Usage:
 *   node --env-file=.env.local scripts/migrate.mjs          # dev
 *   node --env-file=.env.production scripts/migrate.mjs     # prod
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "../app/lib/schema.sql"), "utf8");

if (!process.env.TURSO_DATABASE_URL) {
  console.error("Error: TURSO_DATABASE_URL is not set.");
  process.exit(1);
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log(`Running migration on: ${process.env.TURSO_DATABASE_URL}`);
await db.executeMultiple(schema);
console.log("Migration complete.");
