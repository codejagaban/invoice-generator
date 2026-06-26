/**
 * Cron: orphaned logo cleanup.
 *
 * Runs the Blob mark-and-sweep so logos no longer referenced by any record are
 * deleted. Scheduled in vercel.json. Protected by CRON_SECRET — Vercel sends it
 * as `Authorization: Bearer <CRON_SECRET>` on scheduled invocations.
 */

import { NextRequest, NextResponse } from "next/server";
import { cleanupOrphanedLogos } from "@/app/lib/blob";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  // Require the secret to be configured — this endpoint deletes data.
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupOrphanedLogos();
    console.log("[cleanup-logos]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cleanup-logos]", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
