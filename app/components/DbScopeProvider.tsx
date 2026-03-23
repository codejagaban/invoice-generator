"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";

const GUEST_COOKIE = "guest_id";

const DbReadyContext = createContext(false);

/**
 * Returns true once the storage layer is ready.
 * Pages should skip data fetching until this is true.
 */
export function useDbReady() {
  return useContext(DbReadyContext);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Resolves the user ID for the storage layer:
 * - Authenticated users: use their session user ID
 * - Guests: create/reuse an anonymous Postgres user via cookie
 *
 * All data goes through Postgres — no more IndexedDB.
 */
export default function DbScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    async function resolve() {
      // Authenticated user — use their real user ID
      if (session?.user?.id) {
        // If they have a guest cookie, migrate guest data to their account
        const guestId = getCookie(GUEST_COOKIE);
        if (guestId) {
          try {
            await fetch("/api/migrate-guest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ guestId }),
            });
          } catch (err) {
            console.warn("Guest data migration failed:", err);
          }
          // Clear the cookie
          document.cookie = `${GUEST_COOKIE}=; max-age=0; path=/`;
        }
        setDbScope(session.user.id);
        setReady(true);
        return;
      }

      // Guest — check for existing cookie
      const existingId = getCookie(GUEST_COOKIE);
      if (existingId) {
        // Validate it's still active
        const res = await fetch(`/api/guest?id=${encodeURIComponent(existingId)}`);
        const data = await res.json();
        if (data.valid) {
          setDbScope(existingId);
          setReady(true);
          return;
        }
      }

      // No valid guest session — create one
      const res = await fetch("/api/guest", { method: "POST" });
      const data = await res.json();
      if (data.id) {
        setCookie(GUEST_COOKIE, data.id, 7);
        setDbScope(data.id);
      }
      setReady(true);
    }

    resolve();
  }, [session, status]);

  return (
    <DbReadyContext.Provider value={ready}>
      {children}
    </DbReadyContext.Provider>
  );
}
