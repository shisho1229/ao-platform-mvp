"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // サーバーサイドレンダリング時は何も表示しない
  if (!isMounted) {
    return null
  }

  // 公開ルート
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 公開ルートは認証チェックなしで表示
  if (isPublicRoute) {
    return <>{children}</>
  }

  // ローディング中
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合はログインページへリダイレクト
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = "/auth/signin"
    }
    return null
  }

  // 認証済みの場合は子要素を表示
  return <>{children}</>
}
