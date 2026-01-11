import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// 認証不要のルート（公開ページ）
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/api/auth",
  "/",           // トップページ
  "/stories",    // 体験記一覧・詳細
  "/api/stories", // 体験記API（GET）
  "/api/exploration-themes", // 探究テーマAPI
]

// 認証が必要なルート（これらは明示的にログインが必要）
const protectedRoutes = [
  "/admin",
  "/favorites",
  "/stories/new",
  "/mypage",
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 公開ルートかどうかチェック
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  // 保護されたルートかどうかチェック
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  // API ルートは個別に認証を処理するため基本的に通す
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

  // 未ログインで保護されたページ → ログインページへリダイレクト
  if (!isLoggedIn && isProtectedRoute) {
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
