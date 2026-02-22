import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// 認証不要のルート（ログインページのみ公開）
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 静的ファイルは除外
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 認証APIは常に通す
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // 公開ルート（ログイン・登録ページ）
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  // 未ログインの場合
  if (!isLoggedIn && !isPublicRoute) {
    // APIリクエストには401を返す
    if (nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // ページリクエストはログインページへリダイレクト
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // ログイン済みで認証ページ → ホームへリダイレクト
  if (isLoggedIn && (nextUrl.pathname === "/auth/signin" || nextUrl.pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
