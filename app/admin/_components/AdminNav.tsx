"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Users } from "lucide-react"

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "ダッシュボード",
      icon: BarChart3,
    },
    {
      href: "/admin/stories",
      label: "投稿管理",
      icon: FileText,
    },
    {
      href: "/admin/users",
      label: "ユーザー管理",
      icon: Users,
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6">
        <div className="flex gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-3 flex items-center gap-2 rounded-lg font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
