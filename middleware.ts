import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// 認証不要のルート
const publicRoutes = ["/auth/signin", "/auth/signup", "/api/auth"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 公開ルートかどうかチェック
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // API ルートは除外（認証APIは通す）
  if (nextUrl.pathname.startsWith("/api/") && !nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // 静的ファイルは除外
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 未ログインで認証が必要なページ → ログインページへリダイレクト
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // ログイン済みで認証ページ → ホームへリダイレクト
  if (isLoggedIn && isPublicRoute && !nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
