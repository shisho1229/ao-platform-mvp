"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // 認証済みユーザーがアクセスすべきでないルート（ログイン・登録ページ）
  const authOnlyRoutes = ["/auth/signin", "/auth/signup"]
  const isAuthOnlyRoute = authOnlyRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    // ログイン済みでサインイン/サインアップページにアクセスした場合はホームにリダイレクト
    if (status === "authenticated" && isAuthOnlyRoute) {
      router.push("/")
    }
  }, [status, pathname, router, isAuthOnlyRoute])

  // 認証ページへのアクセス時、認証済みならリダイレクト中を表示
  if (status === "authenticated" && isAuthOnlyRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  // それ以外は各ページに任せる（各ページで独自の認証チェックを行う）
  return <>{children}</>
}
