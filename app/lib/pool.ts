import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isLocalhost =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

// Aiven serves a self-signed CA, so it can't be verified against the public
// bundle. Neon (and other managed providers) use publicly-trusted certs and
// are verified. This makes the app safe to deploy whether prod still points at
// Aiven or has already cut over to Neon — no deploy-ordering required.
const isAiven = process.env.DATABASE_URL.includes("aivencloud.com");

function getSslConfig(): false | { rejectUnauthorized: boolean } {
  if (isLocalhost) return false;
  return { rejectUnauthorized: !isAiven };
}

// Strip sslmode from URL — we configure SSL via the ssl option below.
const connectionString = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "");

const pool = new Pool({
  connectionString,
  ssl: getSslConfig(),
  max: 10,
});

export default pool;
