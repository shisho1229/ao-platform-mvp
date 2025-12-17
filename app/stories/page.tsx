"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { BookOpen, TrendingUp, Award, Globe, Users, GraduationCap, Calendar } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  highSchoolLevel: string
  gradeAverage: string
  admissionType: string
  englishLevel: string
  hasStudyAbroad: boolean
  hasSportsAchievement: boolean
  hasLeaderExperience: boolean
  explorationThemes: Array<{
    theme: {
      id: number
      name: string
    }
  }>
  createdAt: string
}

export default function StoriesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories")
      if (res.ok) {
        const data = await res.json()
        setStories(data)
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const highSchoolLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      LEVEL_1: "~50",
      LEVEL_2: "51-60",
      LEVEL_3: "61-70",
      LEVEL_4: "71~",
    }
    return labels[level] || level
  }

  const gradeAverageLabel = (grade: string) => {
    const labels: Record<string, string> = {
      RANGE_1: "~3.0",
      RANGE_2: "3.1-3.5",
      RANGE_3: "3.6-4.0",
      RANGE_4: "4.1-4.5",
      RANGE_5: "4.6~",
    }
    return labels[grade] || grade
  }

  const englishLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      LV0: "なし",
      LV1: "基礎",
      LV2: "標準",
      LV3: "上位",
      LV4: "最上位",
    }
    return labels[level] || level
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
            合格体験談
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            先輩たちの合格への道のりを参考に、あなたも夢を実現しよう
          </p>
          {session?.user?.role === "GRADUATE" && (
            <Link
              href="/stories/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Award className="w-5 h-5" />
              体験談を投稿する
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              まだ体験談が投稿されていません
            </p>
            <p className="text-gray-500 text-sm mt-2">
              最初の体験談を投稿してみませんか？
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
              >
                {/* カードヘッダー - グラデーション背景 */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
                          {story.university}
                        </h2>
                        <p className="text-blue-100 text-sm font-medium">{story.faculty}</p>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {story.admissionType}
                    </div>
                  </div>
                </div>

                {/* カードボディ */}
                <div className="p-6">
                  {/* スペック情報 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">偏差値</p>
                        <p className="text-sm font-bold text-blue-700 truncate">
                          {highSchoolLevelLabel(story.highSchoolLevel)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">評定</p>
                        <p className="text-sm font-bold text-green-700 truncate">
                          {gradeAverageLabel(story.gradeAverage)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg col-span-2">
                      <Globe className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">英語レベル</p>
                        <p className="text-sm font-bold text-purple-700 truncate">
                          {englishLevelLabel(story.englishLevel)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 探究テーマタグ */}
                  {story.explorationThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">探究テーマ</p>
                      <div className="flex flex-wrap gap-2">
                        {story.explorationThemes.slice(0, 3).map((et) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200"
                          >
                            {et.theme.name}
                          </span>
                        ))}
                        {story.explorationThemes.length > 3 && (
                          <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                            +{story.explorationThemes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 特徴バッジ */}
                  {(story.hasSportsAchievement || story.hasStudyAbroad || story.hasLeaderExperience) && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {story.hasSportsAchievement && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                          <Award className="w-3 h-3" />
                          スポーツ
                        </span>
                      )}
                      {story.hasStudyAbroad && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                          <Globe className="w-3 h-3" />
                          留学
                        </span>
                      )}
                      {story.hasLeaderExperience && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                          <Users className="w-3 h-3" />
                          リーダー
                        </span>
                      )}
                    </div>
                  )}

                  {/* 詳細を見るボタン */}
                  <div className="mt-5 flex items-center justify-between text-blue-600 group-hover:text-blue-700 font-semibold text-sm">
                    <span>詳しく見る</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
