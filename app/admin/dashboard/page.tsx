"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, BookOpen, Heart, TrendingUp, BarChart3, Award, Plus } from "lucide-react"

interface Stats {
  overview: {
    totalUsers: number
    totalStories: number
    publishedStories: number
    pendingStories: number
    draftStories: number
    totalFavorites: number
    recentStories: number
  }
  usersByRole: Array<{ role: string; count: number }>
  storiesByStatus: Array<{ status: string; count: number }>
  topUniversities: Array<{ university: string; count: number }>
  topStories: Array<{ id: string; university: string; faculty: string; favoritesCount: number }>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      // 管理者権限チェック
      if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "STAFF") {
        router.push("/")
        return
      }
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 403) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedDummy = async () => {
    if (isSeeding) return

    setIsSeeding(true)
    setSeedMessage(null)

    try {
      const res = await fetch("/api/admin/seed-dummy", { method: "POST" })
      const data = await res.json()

      if (res.ok) {
        setSeedMessage({ type: "success", text: `${data.count}件のダミー投稿を作成しました` })
        fetchStats() // 統計を再取得
      } else {
        setSeedMessage({ type: "error", text: data.error || "エラーが発生しました" })
      }
    } catch (error) {
      setSeedMessage({ type: "error", text: "ネットワークエラーが発生しました" })
    } finally {
      setIsSeeding(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT": return "下書き"
      case "PENDING_REVIEW": return "添削待ち"
      case "NEEDS_REVISION": return "修正依頼中"
      case "PUBLISHED": return "公開中"
      default: return status
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "最高管理者"
      case "STAFF": return "スタッフ"
      case "USER": return "一般ユーザー"
      case "ADMIN": return "管理者"
      default: return role
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
        <p className="text-gray-600 mt-4">読み込み中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border" style={{ borderColor: '#bac9d0' }}>
        <p className="text-gray-600">統計データの読み込みに失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
          <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#044465' }}>
          ダッシュボード
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          プラットフォームの統計情報
        </p>
      </div>

      {/* ダミー投稿作成ボタン（SUPER_ADMINのみ） */}
      {session?.user?.role === "SUPER_ADMIN" && (
        <div className="bg-white rounded-2xl shadow-lg p-4 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium" style={{ color: '#044465' }}>開発用ツール</p>
                <p className="text-xs text-gray-500">テスト用のダミー投稿を作成</p>
              </div>
            </div>
            <button
              onClick={handleSeedDummy}
              disabled={isSeeding}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: isSeeding ? '#6b7280' : 'linear-gradient(to bottom right, #044465, #055a7a)' }}
            >
              {isSeeding ? "作成中..." : "ダミー投稿を10件作成"}
            </button>
          </div>
          {seedMessage && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              seedMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {seedMessage.text}
            </div>
          )}
        </div>
      )}

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0f4f5' }}>
              <Users className="w-6 h-6" style={{ color: '#044465' }} />
            </div>
            <span className="text-sm text-gray-500">総ユーザー数</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#044465' }}>{stats.overview.totalUsers}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">公開中の体験記</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#044465' }}>{stats.overview.publishedStories}</p>
          <p className="text-sm text-gray-500 mt-1">総投稿数: {stats.overview.totalStories}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">添削待ち</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#044465' }}>{stats.overview.pendingStories}</p>
          <p className="text-sm text-gray-500 mt-1">下書き: {stats.overview.draftStories}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-pink-100">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-sm text-gray-500">お気に入り総数</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#044465' }}>{stats.overview.totalFavorites}</p>
          <p className="text-sm text-gray-500 mt-1">直近7日: {stats.overview.recentStories}件</p>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* ロール別ユーザー数 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: '#044465' }} />
            <h2 className="text-lg font-bold" style={{ color: '#044465' }}>ロール別ユーザー数</h2>
          </div>
          <div className="space-y-3">
            {stats.usersByRole.map((item) => (
              <div key={item.role} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                <span className="text-sm font-medium text-gray-700">{getRoleLabel(item.role)}</span>
                <span className="text-lg font-bold" style={{ color: '#044465' }}>{item.count}名</span>
              </div>
            ))}
          </div>
        </div>

        {/* ステータス別体験記数 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: '#044465' }} />
            <h2 className="text-lg font-bold" style={{ color: '#044465' }}>ステータス別体験記数</h2>
          </div>
          <div className="space-y-3">
            {stats.storiesByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                <span className="text-sm font-medium text-gray-700">{getStatusLabel(item.status)}</span>
                <span className="text-lg font-bold" style={{ color: '#044465' }}>{item.count}件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 大学別投稿数トップ10 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" style={{ color: '#044465' }} />
          <h2 className="text-lg font-bold" style={{ color: '#044465' }}>大学別投稿数 TOP 10</h2>
        </div>
        <div className="space-y-2">
          {stats.topUniversities.map((item, index) => (
            <div key={item.university} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold rounded-full text-sm text-white" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-700">{item.university}</span>
              <span className="text-lg font-bold" style={{ color: '#044465' }}>{item.count}件</span>
            </div>
          ))}
        </div>
      </div>

      {/* 人気の体験記トップ5 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-600" />
          <h2 className="text-lg font-bold" style={{ color: '#044465' }}>人気の体験記 TOP 5</h2>
        </div>
        <div className="space-y-2">
          {stats.topStories.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pink-100 text-pink-600 font-bold rounded-full text-sm">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#044465' }}>{item.university}</p>
                <p className="text-xs text-gray-500">{item.faculty}</p>
              </div>
              <div className="flex items-center gap-1 text-pink-600">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-lg font-bold">{item.favoritesCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
