"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";
import { idbHasData } from "@/app/lib/idb-storage";

const DbReadyContext = createContext(false);
const HasLocalDataContext = createContext(false);

/**
 * Returns true once the storage layer is ready.
 */
export function useDbReady() {
  return useContext(DbReadyContext);
}

/**
 * Returns true if the user has local IndexedDB data that can be synced.
 * Only relevant for authenticated users who previously used the app as guests.
 */
export function useHasLocalData() {
  return useContext(HasLocalDataContext);
}

/**
 * Resolves the storage mode:
 * - Authenticated users → Postgres (via /api/data)
 * - Guests → IndexedDB (local, no server calls)
 */
export default function DbScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    async function resolve() {
      if (session?.user?.id) {
        // Authenticated user → use Postgres
        setDbScope(session.user.id, true);

        // Check if they have local IndexedDB data from when they were a guest
        try {
          const hasData = await idbHasData();
          setHasLocalData(hasData);
        } catch {
          // IndexedDB not available or error — ignore
        }
      } else {
        // Guest → use IndexedDB (no server calls needed)
        setDbScope("local", false);
      }

      setReady(true);
    }

    resolve();
  }, [session, status]);

  return (
    <DbReadyContext.Provider value={ready}>
      <HasLocalDataContext.Provider value={hasLocalData}>
        {children}
      </HasLocalDataContext.Provider>
    </DbReadyContext.Provider>
  );
}
