import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Home, BarChart3, FileText, Users } from "lucide-react"
import AdminNavLinks from "./_components/AdminNavLinks"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // 認証チェック
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // 権限チェック（SUPER_ADMIN, ADMIN, STAFFのみアクセス可能）
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "STAFF"]
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      {/* Header with Navigation */}
      <header className="shadow-md" style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* 左側: タイトルとナビゲーション */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
              <Link href="/admin/users" className="flex-shrink-0">
                <span className="text-white text-lg sm:text-xl font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  管理画面
                </span>
              </Link>

              {/* ナビゲーションリンク */}
              <AdminNavLinks />
            </div>

            {/* 右側: ホームへボタン */}
            <Link
              href="/"
              className="flex-shrink-0 px-3 py-1.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">ホームへ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
    </div>
  )
}
