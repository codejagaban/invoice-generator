"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id || session?.user?.email || "guest";
    setDbScope(userId);
    setReady(true);
  }, [session, status]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
