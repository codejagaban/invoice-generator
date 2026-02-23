/**
 * IndexedDB helper
 * Low-level promise wrappers used by storage.ts
 */

const DB_NAME = "invoice_generator_db";
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

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

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
