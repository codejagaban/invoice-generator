/**
 * Usage:
 *   node --env-file=.env.local scripts/migrate.mjs          # dev (localhost)
 *   node --env-file=.env.production scripts/migrate.mjs     # prod (Aiven)
 */
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "../app/lib/schema.sql"), "utf8");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const isLocalhost = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

await client.connect();
console.log("Running migration...");

const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  await client.query(statement);
}

console.log("Migration complete.");
await client.end();
