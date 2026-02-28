"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  House,
  FileText,
  Users,
  LayoutTemplate,
  Settings2,
  FilePlus2,
  Landmark,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/account", label: "Account", icon: Landmark },
    { href: "/company", label: "Settings", icon: Settings2 },
  ] as const;

  // Close dropdown on outside click — must be before any early returns
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

  // Hide on auth pages — after all hooks
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

  return (
    <header className="border-b border-b-(--border) bg-(--surface) sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold text-black dark:text-white">
            Invoice
          </div>
          <div className="text-xl font-light text-(--muted)">Generator</div>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session && (
            <Link
              href="/invoices/create"
              className="hidden sm:inline-flex items-center gap-2 ml-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
            >
              <FilePlus2 className="h-4 w-4" />
              New Invoice
            </Link>
          )}

          {/* User section */}
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-(--surface-raised) animate-pulse" />
          ) : !session ? (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-black dark:text-white hover:bg-(--surface-raised) transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--surface-raised) transition-colors"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User avatar"}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs font-semibold dark:bg-white dark:text-black">
                    {initials}
                  </span>
                )}
                <span className="hidden sm:block text-sm font-medium text-black dark:text-white max-w-32 truncate">
                  {user?.name ?? user?.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-(--muted)" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-(--border) bg-(--surface) shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-(--border)">
                    <p className="text-sm font-medium text-black dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-(--muted) truncate">
                      {user?.email}
                    </p>
                  </div>
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
          )}
        </div>
      </nav>
    </header>
  );
}
