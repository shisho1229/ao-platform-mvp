"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, BookOpen, Heart, TrendingUp, BarChart3, Award } from "lucide-react"

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-600">統計データの読み込みに失敗しました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
              <p className="text-gray-600">プラットフォームの統計情報</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/stories"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📝 投稿管理
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                👥 ユーザー管理
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 ホーム
              </Link>
            </div>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">総ユーザー数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">公開中の体験記</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.publishedStories}</p>
            <p className="text-sm text-gray-500 mt-1">総投稿数: {stats.overview.totalStories}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">添削待ち</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.pendingStories}</p>
            <p className="text-sm text-gray-500 mt-1">下書き: {stats.overview.draftStories}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-sm text-gray-500">お気に入り総数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalFavorites}</p>
            <p className="text-sm text-gray-500 mt-1">直近7日: {stats.overview.recentStories}件</p>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ロール別ユーザー数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">ロール別ユーザー数</h2>
            </div>
            <div className="space-y-3">
              {stats.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{getRoleLabel(item.role)}</span>
                  <span className="text-lg font-bold text-gray-900">{item.count}名</span>
                </div>
              ))}
            </div>
          </div>

          {/* ステータス別体験記数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">ステータス別体験記数</h2>
            </div>
            <div className="space-y-3">
              {stats.storiesByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{getStatusLabel(item.status)}</span>
                  <span className="text-lg font-bold text-gray-900">{item.count}件</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 大学別投稿数トップ10 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">大学別投稿数 TOP 10</h2>
          </div>
          <div className="space-y-2">
            {stats.topUniversities.map((item, index) => (
              <div key={item.university} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full text-sm">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-700">{item.university}</span>
                <span className="text-lg font-bold text-gray-900">{item.count}件</span>
              </div>
            ))}
          </div>
        </div>

        {/* 人気の体験記トップ5 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-bold text-gray-900">人気の体験記 TOP 5</h2>
          </div>
          <div className="space-y-2">
            {stats.topStories.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pink-100 text-pink-600 font-bold rounded-full text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.university}</p>
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
    </div>
  )
}
