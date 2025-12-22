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
      shortLabel: "ダッシュ",
      icon: BarChart3,
    },
    {
      href: "/admin/stories",
      label: "投稿管理",
      shortLabel: "投稿",
      icon: FileText,
    },
    {
      href: "/admin/users",
      label: "ユーザー管理",
      shortLabel: "ユーザー",
      icon: Users,
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
