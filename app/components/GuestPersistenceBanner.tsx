"use client";

import Link from "next/link";

export default function GuestPersistenceBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          You are in guest mode.
        </p>
        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
          Create an account to keep your invoices, customers, templates, and
          company details saved across sessions.
          <Link
            href="/sign-up"
            className="ml-1.5 font-medium underline underline-offset-4 hover:opacity-80"
          >
            Create account
          </Link>
          <span className="mx-1">or</span>
          <Link
            href="/sign-in"
            className="font-medium underline underline-offset-4 hover:opacity-80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
