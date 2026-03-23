/**
 * Cloud Sync Utilities
 * Pushes IndexedDB data to Turso on save, pulls on login from new device.
 */

import { STORES, dbGetAll, dbPut, openNamedDB } from "./db";

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

/**
 * Migrate data from the guest IndexedDB to the current user's IndexedDB.
 * Called when a user signs up/in after using the app as a guest.
 * Returns true if guest data was found and migrated.
 */
export async function migrateGuestData(): Promise<boolean> {
  try {
    // Check if current user DB already has data
    const local = await readAllStores();
    const hasLocal = Object.values(local).some((arr) => arr.length > 0);
    if (hasLocal) return false; // User already has data, skip

    // Read all data from the guest DB
    const guestDb = await openNamedDB("guest");
    const storeNames = Object.values(STORES);
    const guestData: SyncData = {
      invoices: [],
      templates: [],
      customers: [],
      company_details: [],
      account_details: [],
      settings: [],
    };

    for (const storeName of storeNames) {
      const items = await new Promise<unknown[]>((resolve, reject) => {
        const tx = guestDb.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      (guestData as unknown as Record<string, unknown[]>)[storeName] = items;
    }

    guestDb.close();

    const hasGuestData = Object.values(guestData).some((arr) => arr.length > 0);
    if (!hasGuestData) return false;

    // Write guest data into the current user's DB
    await writeAllStores(guestData);

    // Clear the guest DB so data isn't migrated again
    const guestDbClear = await openNamedDB("guest");
    for (const storeName of storeNames) {
      const tx = guestDbClear.transaction(storeName, "readwrite");
      tx.objectStore(storeName).clear();
    }
    guestDbClear.close();

    return true;
  } catch (error) {
    console.error("[sync] guest migration error:", error);
    return false;
  }
}
