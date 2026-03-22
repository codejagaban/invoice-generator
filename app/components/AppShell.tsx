"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "./Navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isHomePage = pathname === "/";
  const showSidebar = !!session && !isAuthPage && !isHomePage;

  return (
    <>
      <Navigation />
      <div className={showSidebar ? "lg:pl-64" : ""}>
        {children}
      </div>
    </>
  );
}
