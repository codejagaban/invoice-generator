/**
 * IndexedDB helper
 * Low-level promise wrappers used by storage.ts
 * Database is scoped per user to isolate data.
 */

const DB_PREFIX = "invoice_generator_db";
const DB_VERSION = 3;

export const STORES = {
  invoices: "invoices",
  templates: "templates",
  customers: "customers",
  company_details: "company_details",
  account_details: "account_details",
  settings: "settings",
} as const;

let dbInstance: IDBDatabase | null = null;
let currentScope: string = "guest";

/**
 * Set the user scope for the database.
 * Each user gets their own IndexedDB database.
 */
export function setDbScope(userId: string) {
  const newScope = userId || "guest";
  if (newScope === currentScope) return;

  // Close existing connection so the next call opens the right DB
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  currentScope = newScope;
}

export function getDbScope(): string {
  return currentScope;
}

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  const dbName = `${DB_PREFIX}_${currentScope}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export function dbGetAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function dbGetOne<T>(storeName: string, id: string): Promise<T | null> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).get(id);
        request.onsuccess = () => resolve((request.result as T) ?? null);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function dbPut<T>(storeName: string, value: T): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const request = tx.objectStore(storeName).put(value);
        request.onsuccess = () => resolve(value);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function dbDelete(storeName: string, id: string): Promise<boolean> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const request = tx.objectStore(storeName).delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      }),
  );
}
