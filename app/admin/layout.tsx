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

  // 権限チェック（SUPER_ADMIN, MANAGER, ADMIN, STAFFのみアクセス可能）
  const allowedRoles = ["SUPER_ADMIN", "MANAGER", "ADMIN", "STAFF"]
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #ffffff, #f0f4f8)' }}>
      {/* Header */}
      <header className="shadow-md" style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/users" className="flex items-center gap-3">
              <div className="text-white text-2xl font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                管理画面
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                {session.user.name} ({session.user.role === "SUPER_ADMIN" ? "最高管理者" : session.user.role === "ADMIN" ? "管理者" : "スタッフ"})
              </span>
              <Link
                href="/"
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                ホームへ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="py-4">
        <AdminNav />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
