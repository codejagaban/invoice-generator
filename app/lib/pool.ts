import { Pool } from "pg";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isLocalhost =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

function getSslConfig(): false | { rejectUnauthorized: boolean; ca?: string } {
  if (isLocalhost) return false;

  // Try to load Aiven CA certificate
  const caPath = path.join(process.cwd(), "certs", "ca.pem");
  if (fs.existsSync(caPath)) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caPath, "utf8"),
    };
  }

  // Fallback: accept self-signed certs if no CA file
  return { rejectUnauthorized: false };
}

// Strip sslmode from URL — we configure SSL manually via the ssl option
const connectionString = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "");

const pool = new Pool({
  connectionString,
  ssl: getSslConfig(),
  max: 10,
});

export default pool;
