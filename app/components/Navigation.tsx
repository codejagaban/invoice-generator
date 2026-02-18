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
    { href: "/", label: "Home" },
    { href: "/invoices", label: "Invoices" },
    { href: "/templates", label: "Templates" },
    { href: "/company", label: "Settings" },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-50">
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
                  ? "bg-gray-100 text-black dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900"
              }`}
            >
              {item.label}
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
