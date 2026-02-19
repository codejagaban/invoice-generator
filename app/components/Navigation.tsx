"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  FileText,
  Users,
  LayoutTemplate,
  Settings2,
  FilePlus2,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/company", label: "Settings", icon: Settings2 },
  ] as const;

  return (
    <header className="border-b border-b-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold text-black dark:text-white">
            Invoice
          </div>
          <div className="text-xl font-light text-[var(--muted)]">
            Generator
          </div>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-[var(--surface-raised)] text-black dark:text-white"
                  : "text-[var(--muted)] hover:text-black dark:hover:text-white hover:bg-[var(--surface-raised)]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Quick Action */}
        <Link
          href="/invoices/create"
          className="hidden sm:inline-flex items-center gap-2 ml-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
        >
          <FilePlus2 className="h-4 w-4" />
          New Invoice
        </Link>
      </nav>
    </header>
  );
}
