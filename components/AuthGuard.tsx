"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 公開ルート
    const publicRoutes = ["/auth/signin", "/auth/signup"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (status === "loading") {
      return
    }

    // ログインしていない場合は、公開ルート以外はサインインページにリダイレクト
    if (!session && !isPublicRoute) {
      router.push("/auth/signin")
    }

    // ログイン済みでサインインページにアクセスした場合はホームにリダイレクト
    if (session && pathname === "/auth/signin") {
      router.push("/")
    }
  }, [session, status, pathname, router])

  // ローディング中
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  // 公開ルート
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!session && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}
