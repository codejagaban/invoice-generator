"use client";

import { useSession } from "next-auth/react";
import { setDbScope } from "@/app/lib/db";

/**
 * Syncs the IndexedDB scope with the current user session.
 * Authenticated users get an isolated database; guests get a shared "guest" DB.
 * Renders children only after the scope is set to avoid data leaks.
 */
export default function DbScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  // Use email as the stable key — UUIDs can change if the server DB is recreated
  const scopeKey = session?.user?.email || "guest";
  setDbScope(scopeKey);

  return <>{children}</>;
}
