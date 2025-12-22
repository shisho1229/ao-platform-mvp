"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isTimeout, setIsTimeout] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  // タイムアウト処理（10秒）
  useEffect(() => {
    if (status === "loading") {
      const timeout = setTimeout(() => {
        console.error("Session loading timeout - forcing redirect")
        setIsTimeout(true)
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [status])

  useEffect(() => {
    // 公開ルート
    const publicRoutes = ["/auth/signin", "/auth/signup"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (status === "loading" && !isTimeout) {
      return
    }

    // 既にリダイレクト済みの場合は何もしない
    if (hasRedirected) {
      return
    }

    // タイムアウトまたは未認証の場合、公開ルート以外はサインインページにリダイレクト
    if ((isTimeout || !session) && !isPublicRoute) {
      setHasRedirected(true)
      // window.location.hrefを使って確実にリダイレクト
      window.location.href = "/auth/signin"
      return
    }

    // ログイン済みでサインインページにアクセスした場合はホームにリダイレクト
    if (session && pathname === "/auth/signin") {
      setHasRedirected(true)
      window.location.href = "/"
    }
  }, [session, status, pathname, isTimeout, hasRedirected])

  // ローディング中（タイムアウト前）
  if (status === "loading" && !isTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  // リダイレクト中は何も表示しない
  if (hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">リダイレクト中...</p>
        </div>
      </div>
    )
  }

  // タイムアウトした場合
  if (isTimeout) {
    const publicRoutes = ["/auth/signin", "/auth/signup"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (!isPublicRoute) {
      return null // リダイレクト中
    }
  }

  // 公開ルート
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!session && !isPublicRoute && !isTimeout) {
    return null
  }

  return <>{children}</>
}
