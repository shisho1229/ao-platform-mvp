"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [unpublishedCount, setUnpublishedCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isStaffOrAdmin = session?.user?.role === "SUPER_ADMIN" ||
                         session?.user?.role === "ADMIN" ||
                         session?.user?.role === "STAFF"

  // 管理者の場合、未公開体験記の件数を取得
  useEffect(() => {
    if (!isStaffOrAdmin) return

    const fetchUnpublishedCount = async () => {
      try {
        const res = await fetch("/api/admin/stories?published=false")
        if (res.ok) {
          const data = await res.json()
          setUnpublishedCount(Array.isArray(data) ? data.length : 0)
        }
      } catch (error) {
        console.error("未公開件数の取得に失敗:", error)
      }
    }

    fetchUnpublishedCount()
    // 1分ごとに更新
    const interval = setInterval(fetchUnpublishedCount, 60000)
    return () => clearInterval(interval)
  }, [isStaffOrAdmin])

  // ページ遷移時にモバイルメニューを閉じる
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // モバイルメニューが開いているときはスクロールを無効化
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  if (!session?.user) {
    return null
  }

  const navigation = [
    { name: "ホーム", href: "/" },
    { name: "体験記一覧", href: "/stories" },
    { name: "類似検索", href: "/search" },
    { name: "マイ投稿", href: "/my-stories" },
    { name: "お気に入り", href: "/favorites" },
    ...(isStaffOrAdmin ? [{ name: "管理画面", href: "/admin/users", badge: unpublishedCount }] : []),
  ]

  const roleLabel = {
    SUPER_ADMIN: "最高管理者",
    ADMIN: "管理者",
    STAFF: "スタッフ",
    USER: "ユーザー",
  }

  return (
    <>
      <nav style={{ background: '#044465', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                  <img src="/loohcs-logo.svg" alt="Loohcs志塾" className="h-8 w-8 sm:h-10 sm:w-10" />
                  <span className="text-base sm:text-xl font-bold" style={{ color: '#f0f4f8' }}>
                    <span className="hidden xs:inline">Loohcs志塾 </span>合格者体験記
                  </span>
                </Link>
              </div>
              {/* デスクトップナビゲーション */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative"
                    style={{
                      borderColor: pathname === item.href ? '#d4af37' : 'transparent',
                      color: pathname === item.href ? '#d4af37' : '#e8eef5'
                    }}
                  >
                    {item.name}
                    {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* デスクトップユーザー情報 */}
            <div className="hidden md:flex items-center space-x-4">
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

            {/* モバイルハンバーガーボタン */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md"
                style={{ color: '#e8eef5' }}
                aria-expanded={isMobileMenuOpen}
                aria-label="メニューを開く"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* モバイルメニューオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* モバイルメニュー */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#044465' }}
      >
        <div className="flex flex-col h-full">
          {/* モバイルメニューヘッダー */}
          <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="text-lg font-medium" style={{ color: '#f0f4f8' }}>メニュー</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md"
              style={{ color: '#e8eef5' }}
              aria-label="メニューを閉じる"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ユーザー情報 */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="text-sm" style={{ color: '#e8eef5' }}>
              <div className="font-medium">{session.user.name}</div>
              <div className="text-xs mt-1" style={{ color: '#b8c5d0' }}>
                {roleLabel[session.user.role]}
              </div>
            </div>
          </div>

          {/* ナビゲーションリンク */}
          <div className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 text-base font-medium"
                style={{
                  backgroundColor: pathname === item.href ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  color: pathname === item.href ? '#d4af37' : '#e8eef5',
                  borderLeft: pathname === item.href ? '3px solid #d4af37' : '3px solid transparent'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{item.name}</span>
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* ログアウトボタン */}
          <div className="border-t px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                signOut()
              }}
              className="w-full text-left py-2 text-sm"
              style={{ color: '#e8eef5' }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
