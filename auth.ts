import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import sql from "@/app/lib/neon";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

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

        const rows = await sql`
          SELECT id, name, email, image, password FROM users WHERE email = ${credentials.email as string} LIMIT 1
        `;

        const user = rows[0] as
          | { id: string; name: string | null; email: string; image: string | null; password: string | null }
          | undefined;

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google") {
          const rows = await sql`
            SELECT id, name, image FROM users WHERE email = ${user.email ?? ""} LIMIT 1
          `;

          const existing = rows[0] as
            | { id: string; name: string | null; image: string | null }
            | undefined;

          if (!existing) {
            const id = crypto.randomUUID();
            await sql`
              INSERT INTO users (id, name, email, email_verified, image, password, created_at)
              VALUES (${id}, ${user.name ?? null}, ${user.email ?? null}, ${new Date().toISOString()}, ${user.image ?? null}, ${null}, ${new Date().toISOString()})
            `;
            token.id = id;
          } else {
            token.id = existing.id;
            await sql`
              UPDATE users SET name = COALESCE(name, ${user.name ?? null}), image = COALESCE(image, ${user.image ?? null}) WHERE id = ${existing.id}
            `;
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
