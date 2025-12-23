"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // 認証不要のルート（ログイン・登録ページ）
  const publicRoutes = ["/auth/signin", "/auth/signup"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    // 未ログインで認証が必要なページにアクセスした場合はログインページにリダイレクト
    if (status === "unauthenticated" && !isPublicRoute) {
      router.push("/auth/signin")
    }
    // ログイン済みでサインイン/サインアップページにアクセスした場合はホームにリダイレクト
    if (status === "authenticated" && isPublicRoute) {
      router.push("/")
    }
  }, [status, pathname, router, isPublicRoute])

  // 読み込み中
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #044465 0%, #055a7a 40%, #0891b2 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未ログインで認証が必要なページの場合はリダイレクト中を表示
  if (status === "unauthenticated" && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #044465 0%, #055a7a 40%, #0891b2 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white">ログインページに移動中...</p>
        </div>
      </div>
    )
  }

  // ログイン済みで認証ページにアクセスした場合はリダイレクト中を表示
  if (status === "authenticated" && isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #044465 0%, #055a7a 40%, #0891b2 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white">ホームに移動中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
