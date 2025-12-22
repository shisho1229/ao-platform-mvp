import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Home } from "lucide-react"
import AdminNav from "./_components/AdminNav"

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

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      {/* Header */}
      <header className="shadow-md" style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/users" className="flex items-center gap-2 sm:gap-3">
              <div className="text-white text-lg sm:text-2xl font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                管理画面
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-white text-sm">
                {session.user.name} ({session.user.role === "SUPER_ADMIN" ? "最高管理者" : session.user.role === "ADMIN" ? "管理者" : "スタッフ"})
              </span>
              <Link
                href="/"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">ホームへ</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="py-3 sm:py-4">
        <AdminNav />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
    </div>
  )
}
