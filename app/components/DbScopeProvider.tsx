"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";

const SCOPE_KEY = "db_scope";

function getSavedScope(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SCOPE_KEY);
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

  const emailScope = session?.user?.email || null;
  const savedScope = getSavedScope();
  const scope = emailScope || savedScope || (status === "loading" ? null : "guest");

  useEffect(() => {
    if (emailScope) {
      sessionStorage.setItem(SCOPE_KEY, emailScope);
    }
  }, [emailScope]);

  if (!scope) {
    return null;
  }

  setDbScope(scope);

  return <>{children}</>;
}
