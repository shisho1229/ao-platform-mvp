"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Users } from "lucide-react"

export default function AdminNavLinks() {
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
    <div className="flex items-center gap-1 sm:gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.shortLabel}</span>
          </Link>
        )
      })}
    </div>
  )
}
