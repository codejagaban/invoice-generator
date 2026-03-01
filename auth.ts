import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import db from "@/app/lib/turso";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  // Override providers with full implementations
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await db.execute({
          sql: "SELECT id, name, email, image, password FROM users WHERE email = ? LIMIT 1",
          args: [credentials.email as string],
        });

        const user = result.rows[0] as unknown as
          | { id: string; name: string | null; email: string; image: string | null; password: string | null }
          | undefined;

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  // Override callbacks — add jwt + session on top of authorized from authConfig
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google") {
          const result = await db.execute({
            sql: "SELECT id, name, image FROM users WHERE email = ? LIMIT 1",
            args: [user.email ?? null],
          });

          const existing = result.rows[0] as unknown as
            | { id: string; name: string | null; image: string | null }
            | undefined;

          if (!existing) {
            const id = crypto.randomUUID();
            await db.execute({
              sql: `INSERT INTO users (id, name, email, emailVerified, image, password, created_at)
                    VALUES (?, ?, ?, datetime('now'), ?, NULL, datetime('now'))`,
              args: [id, user.name ?? null, user.email ?? null, user.image ?? null],
            });
            token.id = id;
          } else {
            token.id = existing.id;
            await db.execute({
              sql: "UPDATE users SET name = COALESCE(name, ?), image = COALESCE(image, ?) WHERE id = ?",
              args: [user.name ?? null, user.image ?? null, existing.id],
            });
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },

    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
