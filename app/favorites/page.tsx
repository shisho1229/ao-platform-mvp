"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, GraduationCap, Users, BookOpen } from "lucide-react"

interface Favorite {
  id: string
  storyId: string
  story: {
    id: string
    university: string
    faculty: string
    admissionType: string
    year?: number
    firstRoundResult?: string
    secondRoundResult?: string
    authorName?: string
    highSchoolName?: string
    explorationThemes: Array<{
      theme: {
        id: number
        name: string
      }
    }>
  }
  createdAt: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites")
      if (res.ok) {
        const data = await res.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (storyId: string) => {
    try {
      const res = await fetch(`/api/stories/${storyId}/favorite`, {
        method: "DELETE",
      })
      if (res.ok) {
        setFavorites(favorites.filter((fav) => fav.storyId !== storyId))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const getAdmissionResult = (admissionType: string, firstRound?: string, secondRound?: string) => {
    const isFIT = admissionType.includes("FIT")

    // 二次合格の場合
    if (secondRound && ["合格", "AB合格", "A合格", "B合格"].includes(secondRound)) {
      if (isFIT) {
        // FIT入試の場合：最終A合格、最終B合格、最終AB合格
        if (firstRound === "AB合格") return { label: "最終AB合格", color: "bg-green-500" }
        if (firstRound === "A合格") return { label: "最終A合格", color: "bg-green-500" }
        if (firstRound === "B合格") return { label: "最終B合格", color: "bg-green-500" }
        return { label: "最終合格", color: "bg-green-500" }
      } else {
        // FIT入試以外の場合：最終合格
        return { label: "最終合格", color: "bg-green-500" }
      }
    }

    // 一次合格だけど二次不合格の場合
    if (firstRound && ["合格", "AB合格", "A合格", "B合格"].includes(firstRound)) {
      if (isFIT) {
        // FIT入試の場合：書類A合格、書類B合格、書類AB合格
        if (firstRound === "AB合格") return { label: "書類AB合格", color: "bg-blue-500" }
        if (firstRound === "A合格") return { label: "書類A合格", color: "bg-blue-500" }
        if (firstRound === "B合格") return { label: "書類B合格", color: "bg-blue-500" }
        return { label: "書類合格", color: "bg-blue-500" }
      } else {
        // FIT入試以外の場合：書類合格
        return { label: "書類合格", color: "bg-blue-500" }
      }
    }

    return null
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #e91e63, #c2185b)' }}>
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#044465' }}>
            お気に入り
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            後でじっくり読みたい体験談を保存しています
          </p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
          >
            <BookOpen className="w-5 h-5" />
            体験談一覧に戻る
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              お気に入りに登録された体験談はありません
            </p>
            <p className="text-gray-500 text-sm mt-2">
              気になる体験談を見つけたら、ハートマークをクリックして保存しましょう
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                style={{ borderColor: '' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = '#bac9d0')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                {/* カードヘッダー */}
                <div className="p-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link href={`/stories/${favorite.story.id}`} className="block">
                          <h2 className="text-xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
                            {favorite.story.university}
                          </h2>
                          <p className="text-sm font-medium" style={{ color: '#bac9d0' }}>{favorite.story.faculty}</p>
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFavorite(favorite.story.id)}
                        className="flex-shrink-0 ml-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-red-500 transition-colors"
                        title="お気に入りから削除"
                      >
                        <Heart className="w-5 h-5 text-white fill-current" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {favorite.story.admissionType}
                      </div>
                      {favorite.story.year && (
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          {favorite.story.year}年度
                        </div>
                      )}
                      {(() => {
                        const result = getAdmissionResult(favorite.story.admissionType, favorite.story.firstRoundResult, favorite.story.secondRoundResult)
                        return result ? (
                          <div className={`inline-block px-3 py-1 ${result.color} text-white text-xs font-semibold rounded-full`}>
                            {result.label}
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>

                {/* カードボディ */}
                <div className="p-6">
                  <Link href={`/stories/${favorite.story.id}`} className="block">
                    {/* 投稿者情報 */}
                    <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                      {favorite.story.highSchoolName && (
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: '#044465' }} />
                          <p className="text-sm font-semibold" style={{ color: '#044465' }}>
                            {favorite.story.highSchoolName}
                          </p>
                        </div>
                      )}
                      {favorite.story.authorName && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#055a7a' }} />
                          <p className="text-sm" style={{ color: '#044465' }}>
                            {favorite.story.authorName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 探究テーマ */}
                    {favorite.story.explorationThemes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-2">探究テーマ</p>
                        <div className="flex flex-wrap gap-2">
                          {favorite.story.explorationThemes.slice(0, 3).map((et) => (
                            <span
                              key={et.theme.id}
                              className="inline-block px-3 py-1 text-xs font-semibold rounded-full border"
                              style={{ color: '#044465', backgroundColor: '#f0f4f5', borderColor: '#bac9d0' }}
                            >
                              {et.theme.name}
                            </span>
                          ))}
                          {favorite.story.explorationThemes.length > 3 && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                              +{favorite.story.explorationThemes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 詳細を見るボタン */}
                    <div className="mt-5 flex items-center justify-between font-semibold text-sm" style={{ color: '#044465' }}>
                      <span>詳しく見る</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
