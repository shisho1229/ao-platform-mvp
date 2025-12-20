"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) {
    return null
  }

  const isStaffOrAdmin = session?.user?.role === "SUPER_ADMIN" ||
                         session?.user?.role === "ADMIN" ||
                         session?.user?.role === "STAFF"

  const navigation = [
    { name: "ホーム", href: "/" },
    { name: "体験談一覧", href: "/stories" },
    { name: "類似検索", href: "/search" },
    ...(isStaffOrAdmin ? [{ name: "管理画面", href: "/admin/users" }] : []),
  ]

  const roleLabel = {
    SUPER_ADMIN: "最高管理者",
    ADMIN: "管理者",
    STAFF: "スタッフ",
    USER: "ユーザー",
  }

  return (
    <nav style={{ background: '#044465', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <img src="/loohcs-logo.svg" alt="Loohcs志塾" className="h-10 w-10" />
                <span className="text-xl font-bold" style={{ color: '#f0f4f8' }}>
                  Loohcs志塾 合格者体験談
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{
                    borderColor: pathname === item.href ? '#d4af37' : 'transparent',
                    color: pathname === item.href ? '#d4af37' : '#e8eef5'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm" style={{ color: '#e8eef5' }}>
              <span className="font-medium">{session.user.name}</span>
              <span className="ml-2 text-xs" style={{ color: '#b8c5d0' }}>
                ({roleLabel[session.user.role]})
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm"
              style={{ color: '#e8eef5' }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
