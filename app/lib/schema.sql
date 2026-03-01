-- Invoice Generator SQLite Schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
  id          TEXT NOT NULL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  zip_code    TEXT NOT NULL,
  country     TEXT NOT NULL,
  logo        TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id                TEXT NOT NULL PRIMARY KEY,
  invoice_number    TEXT NOT NULL UNIQUE,
  date              TEXT NOT NULL,
  due_date          TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  customer_id       TEXT,
  customer_snapshot TEXT NOT NULL,
  notes             TEXT,
  tax_rate          REAL,
  currency          TEXT NOT NULL DEFAULT 'GBP',
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          TEXT NOT NULL PRIMARY KEY,
  invoice_id  TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity    REAL NOT NULL,
  rate        REAL NOT NULL,
  discount    REAL,
  tax_rate    REAL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
  id               TEXT NOT NULL PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  customer_partial TEXT NOT NULL,
  items_partial    TEXT NOT NULL,
  notes            TEXT,
  tax_rate         REAL,
  currency         TEXT NOT NULL DEFAULT 'GBP',
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS company_details (
  id          TEXT    NOT NULL PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  phone       TEXT,
  address     TEXT    NOT NULL,
  city        TEXT    NOT NULL,
  state       TEXT    NOT NULL,
  zip_code    TEXT    NOT NULL,
  country     TEXT    NOT NULL,
  website     TEXT,
  tax_id      TEXT,
  logo        TEXT,
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS account_details (
  id                  TEXT    NOT NULL PRIMARY KEY,
  account_holder_name TEXT    NOT NULL,
  bank_name           TEXT    NOT NULL,
  account_number      TEXT    NOT NULL,
  sort_code           TEXT,
  routing_number      TEXT,
  iban                TEXT,
  swift_bic           TEXT,
  currency            TEXT,
  payment_reference   TEXT,
  notes               TEXT,
  is_default          INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT    NOT NULL,
  updated_at          TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id               TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  updated_at       TEXT NOT NULL
);

-- Seed default settings row
INSERT OR IGNORE INTO settings (id, default_currency, updated_at)
VALUES ('default', 'GBP', datetime('now'));

-- ── Auth: users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT    NOT NULL PRIMARY KEY,
  name          TEXT,
  email         TEXT    UNIQUE,
  emailVerified TEXT,
  image         TEXT,
  password      TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
