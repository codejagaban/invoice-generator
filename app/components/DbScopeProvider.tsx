"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";

const SCOPE_KEY = "db_scope";

const DbReadyContext = createContext(false);

/**
 * Returns true once the storage layer (IndexedDB or Postgres) is ready.
 * Pages should skip data fetching until this is true.
 */
export function useDbReady() {
  return useContext(DbReadyContext);
}

/**
 * Sets the IndexedDB scope for guest users.
 * Authenticated users use Postgres via /api/data — IndexedDB is not used.
 * Guest users get a "guest" scoped IndexedDB.
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

    const emailScope = session?.user?.email || null;
    const scope = emailScope || sessionStorage.getItem(SCOPE_KEY) || "guest";

    if (emailScope) {
      sessionStorage.setItem(SCOPE_KEY, emailScope);
    }

    setDbScope(scope);
    setReady(true);
  }, [session, status]);

  return (
    <DbReadyContext.Provider value={ready}>
      {children}
    </DbReadyContext.Provider>
  );
}
