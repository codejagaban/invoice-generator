-- Invoice Generator PostgreSQL Schema

CREATE TABLE IF NOT EXISTS customers (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  address     TEXT         NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  zip_code    VARCHAR(20)  NOT NULL,
  country     VARCHAR(100) NOT NULL,
  logo        TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  invoice_number   VARCHAR(100) NOT NULL UNIQUE,
  date             DATE         NOT NULL,
  due_date         DATE         NOT NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  customer_id      VARCHAR(36),
  customer_snapshot JSONB       NOT NULL,
  notes            TEXT,
  tax_rate         DECIMAL(5,2),
  currency         VARCHAR(10)  NOT NULL DEFAULT 'GBP',
  created_at       TIMESTAMP    NOT NULL,
  updated_at       TIMESTAMP    NOT NULL,
  CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          VARCHAR(36)    NOT NULL PRIMARY KEY,
  invoice_id  VARCHAR(36)    NOT NULL,
  description TEXT           NOT NULL,
  quantity    DECIMAL(10,2)  NOT NULL,
  rate        DECIMAL(10,2)  NOT NULL,
  discount    DECIMAL(5,2),
  tax_rate    DECIMAL(5,2),
  CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  customer_partial JSONB        NOT NULL,
  items_partial    JSONB        NOT NULL,
  notes            TEXT,
  tax_rate         DECIMAL(5,2),
  currency         VARCHAR(10)  NOT NULL DEFAULT 'GBP',
  created_at       TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS company_details (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  address     TEXT         NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  zip_code    VARCHAR(20)  NOT NULL,
  country     VARCHAR(100) NOT NULL,
  website     VARCHAR(255),
  tax_id      VARCHAR(100),
  logo        TEXT,
  is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL,
  updated_at  TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS account_details (
  id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
  account_holder_name VARCHAR(255) NOT NULL,
  bank_name           VARCHAR(255) NOT NULL,
  account_number      VARCHAR(100) NOT NULL,
  sort_code           VARCHAR(50),
  routing_number      VARCHAR(50),
  iban                VARCHAR(50),
  swift_bic           VARCHAR(50),
  currency            VARCHAR(10),
  payment_reference   VARCHAR(255),
  notes               TEXT,
  is_default          BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP    NOT NULL,
  updated_at          TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id               VARCHAR(10)  NOT NULL PRIMARY KEY DEFAULT 'default',
  default_currency VARCHAR(10)  NOT NULL DEFAULT 'GBP',
  updated_at       TIMESTAMP    NOT NULL
);

-- Seed default settings row
INSERT INTO settings (id, default_currency, updated_at)
VALUES ('default', 'GBP', NOW())
ON CONFLICT DO NOTHING;

-- ── Auth: users ──────────────────────────────────────────────────────────────
-- Stores both credentials users (password set) and OAuth users (password NULL).
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(255),
  email         VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMP,
  image         TEXT,
  password      VARCHAR(255),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
