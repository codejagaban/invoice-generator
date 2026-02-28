import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import pool from "@/app/lib/postgres";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await pool.query(
          "SELECT id, name, email, image, password FROM users WHERE email = $1 LIMIT 1",
          [credentials.email],
        );

        const users = result.rows as Array<{
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          password: string | null;
        }>;

        if (!users.length || !users[0].password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          users[0].password,
        );
        if (!isValid) return null;

        return {
          id: users[0].id,
          name: users[0].name,
          email: users[0].email,
          image: users[0].image,
        };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google") {
          // Find or create PostgreSQL user for Google sign-in
          const existing = await pool.query(
            "SELECT id, name, image FROM users WHERE email = $1 LIMIT 1",
            [user.email ?? null],
          );
          const users = existing.rows as Array<{ id: string; name: string | null; image: string | null }>;

          if (users.length === 0) {
            // New user — create from Google data
            const id = crypto.randomUUID();
            await pool.query(
              `INSERT INTO users (id, name, email, "emailVerified", image, password, created_at)
               VALUES ($1, $2, $3, NOW(), $4, NULL, NOW())`,
              [id, user.name ?? null, user.email ?? null, user.image ?? null],
            );
            token.id = id;
          } else {
            // Existing user — only fill in missing name/image, don't overwrite
            token.id = users[0].id;
            await pool.query(
              "UPDATE users SET name = COALESCE(name, $1), image = COALESCE(image, $2) WHERE id = $3",
              [user.name ?? null, user.image ?? null, users[0].id],
            );
          }
        } else {
          // Credentials: id comes directly from authorize()
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
