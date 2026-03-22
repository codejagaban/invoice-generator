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
    authorized() {
      // All routes are public — data is isolated per user via scoped IndexedDB
      return true;
    },
  },
} satisfies NextAuthConfig;
