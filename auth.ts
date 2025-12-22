import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { checkRateLimit } from "./lib/security"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // セッション設定（セキュリティ強化）
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間でセッション期限切れ
    updateAge: 60 * 60, // 1時間ごとにトークンを更新
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()

        // ログイン試行のレート制限（15分間に10回まで）
        const rateLimit = checkRateLimit(`login:${email}`, 10, 15 * 60 * 1000)
        if (!rateLimit.allowed) {
          throw new Error("ログイン試行回数が上限に達しました。15分後に再試行してください。")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        })

        if (!user) {
          // タイミング攻撃対策: ユーザーが存在しなくても同様の処理時間をかける
          await bcrypt.compare(credentials.password as string, "$2a$10$dummy.hash.for.timing.attack.prevention")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // 承認されていないユーザーはログインできない
        if (!user.approved) {
          throw new Error("アカウントが管理者によって承認されていません。承認をお待ちください。")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id as string
        token.role = user.role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})
