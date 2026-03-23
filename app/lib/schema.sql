-- Invoice Generator PostgreSQL Schema

-- ── Auth ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  name           TEXT,
  email          TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image          TEXT,
  password       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Customers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  address   TEXT NOT NULL DEFAULT '',
  city      TEXT NOT NULL DEFAULT '',
  state     TEXT NOT NULL DEFAULT '',
  zip_code  TEXT NOT NULL DEFAULT '',
  country   TEXT NOT NULL DEFAULT '',
  logo      TEXT
);

-- ── Invoices ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL,
  date            TEXT NOT NULL,
  due_date        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  customer        JSONB NOT NULL,
  company         JSONB,
  items           JSONB NOT NULL DEFAULT '[]',
  notes           TEXT,
  tax_rate        DOUBLE PRECISION,
  currency        TEXT NOT NULL DEFAULT 'GBP',
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

-- ── Templates ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  customer    JSONB NOT NULL DEFAULT '{}',
  items       JSONB NOT NULL DEFAULT '[]',
  notes       TEXT,
  tax_rate    DOUBLE PRECISION,
  currency    TEXT NOT NULL DEFAULT 'GBP',
  created_at  TEXT NOT NULL
);

-- ── Company Details ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_details (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  address     TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT '',
  state       TEXT NOT NULL DEFAULT '',
  zip_code    TEXT NOT NULL DEFAULT '',
  country     TEXT NOT NULL DEFAULT '',
  website     TEXT,
  tax_id      TEXT,
  logo        TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- ── Account / Bank Details ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_details (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name           TEXT NOT NULL,
  account_number      TEXT NOT NULL,
  sort_code           TEXT,
  routing_number      TEXT,
  iban                TEXT,
  swift_bic           TEXT,
  currency            TEXT,
  payment_reference   TEXT,
  notes               TEXT,
  is_default          BOOLEAN NOT NULL DEFAULT false,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

-- ── Settings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  updated_at       TEXT NOT NULL
);
