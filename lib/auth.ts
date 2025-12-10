import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email as string },
        });

        if (!staff) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          staff.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          jukuCampus: staff.jukuCampus,
          role: staff.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jukuCampus = user.jukuCampus;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.jukuCampus = token.jukuCampus as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
