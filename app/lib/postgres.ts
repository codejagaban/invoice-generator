import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || process.env.USER,
  password: process.env.PG_PASSWORD || "",
  database: process.env.PG_DATABASE || "invoice_generator",
  max: 10,
  idleTimeoutMillis: 30000,
});

export default pool;
