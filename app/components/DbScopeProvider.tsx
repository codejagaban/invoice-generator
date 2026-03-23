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
 * Syncs the IndexedDB scope with the current user session.
 * Authenticated users get an isolated database; guests get a shared "guest" DB.
 *
 * Key safeguard: once a user scope is set, we never downgrade to "guest"
 * during the same browser session. This prevents data loss when the
 * session briefly returns null during token refresh or redeployment.
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

  // Persist scope to sessionStorage when we have an email
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
