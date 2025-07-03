import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"; // <-- DIUBAH: Mengimpor dari paket baru
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from 'bcrypt';

import { db } from "~/server/db";
import type { DefaultSession, User } from "next-auth";

/**
 * Module augmentation for `next-auth` types.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

/**
 * Konfigurasi utama untuk Auth.js (NextAuth v5)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!, 
        role: token.role as string,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
            id: user.id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  }
});
