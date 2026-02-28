import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import pool from "@/app/lib/mysql";

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

        const [rows] = await pool.execute(
          "SELECT id, name, email, image, password FROM users WHERE email = ? LIMIT 1",
          [credentials.email],
        );

        const users = rows as Array<{
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
          // Find or create MySQL user for Google sign-in
          const [existing] = await pool.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [user.email],
          );
          const users = existing as Array<{ id: string }>;

          if (users.length === 0) {
            const id = crypto.randomUUID();
            await pool.execute(
              `INSERT INTO users (id, name, email, emailVerified, image, password, created_at)
               VALUES (?, ?, ?, NOW(), ?, NULL, NOW())`,
              [id, user.name, user.email, user.image],
            );
            token.id = id;
          } else {
            token.id = users[0].id;
            await pool.execute(
              "UPDATE users SET name = ?, image = ? WHERE id = ?",
              [user.name, user.image, users[0].id],
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
