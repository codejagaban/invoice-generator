"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Users,
  LayoutTemplate,
  Settings2,
  FilePlus2,
  Landmark,
  BarChart3,
  Building2,
  LogIn,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const allNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, authOnly: false },
    { href: "/invoices", label: "Invoices", icon: FileText, authOnly: false },
    { href: "/customers", label: "Customers", icon: Users, authOnly: true },
    { href: "/templates", label: "Templates", icon: LayoutTemplate, authOnly: true },
    { href: "/account", label: "Accounts", icon: Landmark, authOnly: true },
    { href: "/company", label: "Companies", icon: Building2, authOnly: true },
    { href: "/settings", label: "Settings", icon: Settings2, authOnly: true },
  ] as const;

  const navItems = allNavItems.filter((item) => !item.authOnly || !!session);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Hide on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") return null;

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  const LogoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className="h-full w-full">
      <rect width="40" height="40" rx="10" className="fill-black dark:fill-white"/>
      <path d="M12 8h10l6 6v18a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8z" fill="none" className="stroke-white dark:stroke-black" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M22 8v6h6" fill="none" className="stroke-white dark:stroke-black" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 17v10M17 19.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2-.9 2-2" fill="none" className="stroke-white dark:stroke-black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Top bar for home page or unauthenticated users
  if (status === "loading" || !session || pathname === "/") {
    const showGuestNav = !session && pathname !== "/";
    return (
      <>
        <header className="border-b border-b-(--border) bg-(--surface) sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            {/* Left: hamburger (mobile, non-home guest) + logo */}
            <div className="flex items-center gap-2">
              {showGuestNav && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="sm:hidden p-2 rounded-lg hover:bg-(--surface-raised) transition-colors"
                >
                  <Menu className="h-5 w-5 text-black dark:text-white" />
                </button>
              )}
              <Link href="/">
                <div className="h-8 w-8">{LogoIcon}</div>
              </Link>
            </div>

            {/* Center: nav links (desktop only, non-home guests) */}
            {showGuestNav && (
              <div className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-(--surface-raised) text-black dark:text-white"
                        : "text-(--muted) hover:text-black dark:hover:text-white hover:bg-(--surface-raised)"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/invoices/create"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
              >
                <FilePlus2 className="h-4 w-4" />
                New Invoice
              </Link>
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-(--surface-raised) animate-pulse" />
              ) : session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-black dark:text-white hover:bg-(--surface-raised) transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </header>

        {/* Mobile slide-out menu for guests */}
        {showGuestNav && mobileOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] sm:hidden" onClick={() => setMobileOpen(false)} />
            <div className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1a1a1a] border-r border-(--border) shadow-xl sm:hidden">
              <div className="flex items-center justify-between px-4 py-4 border-b border-(--border)">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <div className="h-7 w-7">{LogoIcon}</div>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-(--surface-raised)">
                  <X className="h-5 w-5 text-(--muted)" />
                </button>
              </div>
              <div className="px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-(--surface-raised) text-black dark:text-white"
                        : "text-(--muted) hover:text-black dark:hover:text-white hover:bg-(--surface-raised)"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-(--border) mt-3">
                  <Link
                    href="/invoices/create"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-black text-white dark:bg-white dark:text-black"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    New Invoice
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Authenticated — sidebar layout
  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden border-b border-b-(--border) bg-(--surface) sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-(--surface-raised) transition-colors"
          >
            <Menu className="h-5 w-5 text-black dark:text-white" />
          </button>
          <Link href="/">
            <div className="h-7 w-7">{LogoIcon}</div>
          </Link>
          <div className="w-9" /> {/* spacer for centering */}
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-(--border) bg-(--surface) flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-(--border)">
          <Link href="/">
            <div className="h-8 w-8">{LogoIcon}</div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-(--surface-raised) transition-colors"
          >
            <X className="h-4 w-4 text-(--muted)" />
          </button>
        </div>

        {/* New Invoice button */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/invoices/create"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
          >
            <FilePlus2 className="h-4 w-4" />
            New Invoice
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-(--surface-raised) text-black dark:text-white"
                  : "text-(--muted) hover:text-black dark:hover:text-white hover:bg-(--surface-raised)"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-(--border) p-3">
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 hover:bg-(--surface-raised) transition-colors"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User avatar"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-semibold dark:bg-white dark:text-black shrink-0">
                    {initials}
                  </span>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-xs text-(--muted) truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-(--muted) shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 w-full rounded-xl border border-(--border) bg-(--surface) shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-(--surface-raised) transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-(--muted)" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 hover:bg-(--surface-raised) transition-colors text-sm font-medium text-(--muted) hover:text-black dark:hover:text-white"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
