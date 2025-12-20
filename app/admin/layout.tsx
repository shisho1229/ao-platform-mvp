import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Users, FileText, Home } from "lucide-react"

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
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <Link
              href="/admin/users"
              className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              <Users className="w-5 h-5" />
              ユーザー管理
            </Link>
            <Link
              href="/admin/stories"
              className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            >
              <FileText className="w-5 h-5" />
              投稿管理
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
