"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";
import { pushToCloud, pullFromCloud, migrateGuestData } from "@/app/lib/sync";

const SCOPE_KEY = "db_scope";
const SYNCED_KEY = "db_synced";

function getSavedScope(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SCOPE_KEY);
}

/**
 * Syncs the IndexedDB scope with the current user session.
 * Authenticated users get an isolated database; guests get a shared "guest" DB.
 *
 * On login:
 * - Pulls cloud data into IndexedDB if local is empty (new device)
 * - Pushes IndexedDB data to cloud for backup
 *
 * On every save (via storage.ts), data is also pushed to cloud.
 */
export default function DbScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Derive scope without setState — purely computed
  const emailScope = session?.user?.email || null;
  const savedScope = getSavedScope();
  const scope = emailScope || savedScope || (status === "loading" ? null : "guest");
  const isAuthenticated = !!emailScope;

  // Persist scope to sessionStorage when we have an email
  useEffect(() => {
    if (emailScope) {
      sessionStorage.setItem(SCOPE_KEY, emailScope);
    }
  }, [emailScope]);

  // Sync on login — pull then push
  const syncOnLogin = useCallback(async () => {
    if (!isAuthenticated) return;

    // Only sync once per browser session
    const alreadySynced = sessionStorage.getItem(SYNCED_KEY);
    if (alreadySynced === emailScope) return;

    // Mark as syncing immediately to prevent double-sync
    sessionStorage.setItem(SYNCED_KEY, emailScope!);

    // 1. Migrate guest data if user was using app before signing in
    const migrated = await migrateGuestData();
    if (migrated) {
      // Push migrated data to cloud, then reload to reflect it
      await pushToCloud();
      window.location.reload();
      return;
    }

    // 2. Pull cloud data if local is empty (new device / cleared cache)
    const pulled = await pullFromCloud();
    if (pulled) {
      window.location.reload();
      return;
    }

    // 3. Push local data to cloud as backup
    await pushToCloud();
  }, [isAuthenticated, emailScope]);

  useEffect(() => {
    syncOnLogin();
  }, [syncOnLogin]);

  if (!scope) {
    return null;
  }

  setDbScope(scope);

  return <>{children}</>;
}
