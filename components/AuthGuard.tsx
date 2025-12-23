"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // 認証が必要なルート（これらのルートだけを保護）
  const protectedRoutes = [
    "/favorites",
    "/my-stories",
    "/stories/new",
    "/profile",
    "/admin",
  ]

  // 認証済みユーザーがアクセスすべきでないルート
  const authOnlyRoutes = ["/auth/signin", "/auth/signup"]

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthOnlyRoute = authOnlyRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (status === "loading") {
      return
    }

    // ログインしていない場合、保護されたルートはサインインページにリダイレクト
    if (!session && isProtectedRoute) {
      router.push("/auth/signin")
    }

    // ログイン済みでサインインページにアクセスした場合はホームにリダイレクト
    if (session && isAuthOnlyRoute) {
      router.push("/")
    }
  }, [session, status, pathname, router, isProtectedRoute, isAuthOnlyRoute])

  // ローディング中は保護されたルートのみローディング表示
  if (status === "loading" && isProtectedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  // ログインしていない場合、保護されたルートは何も表示しない（リダイレクト中）
  if (!session && isProtectedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return <>{children}</>
}
