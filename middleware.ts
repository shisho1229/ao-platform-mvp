import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // 公開ルート
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // ログインしていない場合は、公開ルート以外はサインインページにリダイレクト
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // ログイン済みでサインインページにアクセスした場合はホームにリダイレクト
  if (isLoggedIn && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
