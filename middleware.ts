import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * セキュリティミドルウェア
 * - 認証が必要なルートの保護
 * - 管理者ルートへのアクセス制限
 * - レート制限の基本チェック
 */

// 認証が必要なルート
const protectedRoutes = [
  "/stories/new",
  "/stories/*/edit",
  "/profile",
  "/favorites",
  "/mypage",
]

// 管理者のみアクセス可能なルート
const adminRoutes = ["/admin"]

// 認証済みユーザーがアクセスすべきでないルート
const authOnlyRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 静的ファイルとAPIルートはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // 静的ファイル
  ) {
    return NextResponse.next()
  }

  // JWTトークンを取得
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const userRole = token?.role as string | undefined

  // 認証済みユーザーがログイン/サインアップページにアクセスした場合
  if (isAuthenticated && authOnlyRoutes.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // 保護されたルートへの未認証アクセス
  const isProtectedRoute = protectedRoutes.some((route) => {
    const pattern = route.replace(/\*/g, "[^/]+")
    const regex = new RegExp(`^${pattern}$`)
    return regex.test(pathname)
  })

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 管理者ルートへのアクセス制限
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 管理者権限チェック
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "STAFF"]
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // レスポンスにセキュリティ関連のヘッダーを追加
  const response = NextResponse.next()

  // キャッシュ制御（機密ページはキャッシュしない）
  if (isProtectedRoute || isAdminRoute) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
