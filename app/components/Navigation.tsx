"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/invoices", label: "Invoices", icon: "file" },
    { href: "/customers", label: "Customers", icon: "users" },
    { href: "/templates", label: "Templates", icon: "layers" },
    { href: "/company", label: "Settings", icon: "settings" },
  ] as const;

  const icons = {
    home: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </svg>
    ),
    file: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    ),
    users: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 17v-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1" />
        <circle cx="9" cy="8" r="3" />
        <path d="M19 17v-1a3 3 0 0 0-2-2.8" />
        <path d="M16.5 6.5a2.5 2.5 0 1 1 0 5" />
      </svg>
    ),
    layers: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3 9 5-9 5-9-5 9-5z" />
        <path d="m3 13 9 5 9-5" />
      </svg>
    ),
    settings: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
      </svg>
    ),
  };

  return (
    <header className="border-b border-b-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold text-black dark:text-white">
            Invoice
          </div>
          <div className="text-xl font-light text-gray-500 dark:text-gray-400">
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
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-[var(--surface-raised)]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {icons[item.icon]}
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Quick Action */}
        <Link
          href="/invoices/create"
          className="hidden sm:inline-block ml-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors text-sm"
        >
          New Invoice
        </Link>
      </nav>
    </header>
  );
}
