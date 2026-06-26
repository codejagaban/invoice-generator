/**
 * Vercel Blob helpers (server-only).
 *
 * Logos are uploaded once on first save: when an authenticated user saves a
 * record whose logo is still a base64 `data:` URL, we push the bytes to Vercel
 * Blob and persist the returned public URL instead. This keeps Postgres holding
 * a ~80-byte URL rather than a multi-KB base64 string.
 */

import { put, list, del } from "@vercel/blob";
import { pgGetReferencedLogoUrls } from "./pg-storage";

function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

/** Upload a base64 data URL to Blob and return its public URL. */
async function uploadDataUrl(userId: string, dataUrl: string): Promise<string> {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/png";
  const ext = mime.split("/")[1]?.split("+")[0] || "png";
  const buffer = Buffer.from(base64, "base64");

  const { url } = await put(`logos/${userId}/${crypto.randomUUID()}.${ext}`, buffer, {
    access: "public",
    contentType: mime,
  });
  return url;
}

/**
 * Replace any base64 `data:` logo in a record with an uploaded Blob URL.
 * Mutates and returns the same object. Covers the top-level `logo` field
 * (customers, company_details) and the nested `customer`/`company` snapshots
 * embedded in invoices and templates. Values that are already URLs are left
 * untouched, so this is a no-op once a logo has been uploaded.
 */
export async function uploadLogos<T>(userId: string, data: T): Promise<T> {
  if (!data || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;

  if (isDataUrl(record.logo)) {
    record.logo = await uploadDataUrl(userId, record.logo);
  }

  for (const key of ["customer", "company"] as const) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      if (isDataUrl(nestedRecord.logo)) {
        nestedRecord.logo = await uploadDataUrl(userId, nestedRecord.logo);
      }
    }
  }

  return data;
}

/**
 * Mark-and-sweep garbage collection for logo blobs.
 *
 * Lists every blob under `logos/`, collects every logo URL still referenced
 * anywhere in the database (customer/company rows plus the snapshots embedded
 * in invoices and templates), and deletes blobs that nothing points to. This is
 * safe with shared references — a blob is removed only when *no* record uses it.
 *
 * A grace window protects very recently uploaded blobs from being swept before
 * their owning row has settled.
 */
export async function cleanupOrphanedLogos(options?: {
  graceMs?: number;
}): Promise<{ scanned: number; deleted: number }> {
  const graceMs = options?.graceMs ?? 60 * 60 * 1000; // 1 hour
  const cutoff = Date.now() - graceMs;

  const referenced = new Set(await pgGetReferencedLogoUrls());

  const orphaned: string[] = [];
  let scanned = 0;
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: "logos/", cursor, limit: 1000 });
    for (const blob of page.blobs) {
      scanned++;
      const uploadedAt = new Date(blob.uploadedAt).getTime();
      if (!referenced.has(blob.url) && uploadedAt < cutoff) {
        orphaned.push(blob.url);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  // del() accepts an array; batch to keep individual requests reasonable.
  const BATCH = 100;
  for (let i = 0; i < orphaned.length; i += BATCH) {
    await del(orphaned.slice(i, i + BATCH));
  }

  return { scanned, deleted: orphaned.length };
}
