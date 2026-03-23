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

  // setDbScope is a pure variable assignment — safe to call during render
  const userId = session?.user?.id || session?.user?.email || "guest";
  setDbScope(userId);

  return <>{children}</>;
}
