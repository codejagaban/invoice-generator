import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth config — no DB or Node.js-only imports.
 * Used by middleware for session checks.
 * Full config (with bcrypt + Turso) lives in auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
    }),
    // Stub — real authorize() logic is in auth.ts
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Public routes: invoice create & individual invoice view
      if (path === "/invoices/create" || /^\/invoices\/[^/]+$/.test(path)) {
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
