/**
 * Cloud Sync Utilities
 * Pushes IndexedDB data to Turso on save, pulls on login from new device.
 */

import { STORES, dbGetAll, dbPut } from "./db";

interface SyncData {
  invoices: unknown[];
  templates: unknown[];
  customers: unknown[];
  company_details: unknown[];
  account_details: unknown[];
  settings: unknown[];
}

/**
 * Read all IndexedDB stores into a single object.
 */
async function readAllStores(): Promise<SyncData> {
  const [invoices, templates, customers, company_details, account_details, settings] =
    await Promise.all([
      dbGetAll(STORES.invoices),
      dbGetAll(STORES.templates),
      dbGetAll(STORES.customers),
      dbGetAll(STORES.company_details),
      dbGetAll(STORES.account_details),
      dbGetAll(STORES.settings),
    ]);

  return { invoices, templates, customers, company_details, account_details, settings };
}

/**
 * Write sync data into IndexedDB stores (merges by id — remote wins on conflict).
 */
async function writeAllStores(data: SyncData): Promise<void> {
  const writes: Promise<unknown>[] = [];

  for (const [storeName, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item && typeof item === "object" && "id" in item) {
        writes.push(dbPut(storeName, item));
      }
    }
  }

  await Promise.all(writes);
}

/**
 * Push all IndexedDB data to the cloud (Turso via /api/sync).
 */
export async function pushToCloud(): Promise<boolean> {
  try {
    const data = await readAllStores();

    // Don't push if there's no meaningful data
    const hasData = Object.values(data).some((arr) => arr.length > 0);
    if (!hasData) return true;

    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      console.error("[sync] push failed:", await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[sync] push error:", error);
    return false;
  }
}

/**
 * Pull cloud data into IndexedDB (only if local is empty).
 * Returns true if data was pulled, false if skipped or failed.
 */
export async function pullFromCloud(): Promise<boolean> {
  try {
    // Check if local already has data
    const local = await readAllStores();
    const hasLocal = Object.values(local).some((arr) => arr.length > 0);
    if (hasLocal) return false; // Don't overwrite local data

    const res = await fetch("/api/sync");
    if (!res.ok) {
      console.error("[sync] pull failed:", await res.text());
      return false;
    }

    const { data } = await res.json();
    if (!data) return false;

    await writeAllStores(data as SyncData);
    return true;
  } catch (error) {
    console.error("[sync] pull error:", error);
    return false;
  }
}
