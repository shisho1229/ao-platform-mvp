"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { BookOpen, Users, GraduationCap, Filter, Award } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  highSchoolLevel: string
  highSchoolName?: string
  gradeAverage: string
  campus?: string
  admissionType: string
  year?: number
  firstRoundResult?: string
  secondRoundResult?: string
  authorName?: string
  researchTheme?: string
  author: {
    name: string
    campus?: string
  }
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
  const [keywordFilter, setKeywordFilter] = useState("")
  const [universityFilter, setUniversityFilter] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [campusFilter, setCampusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [keywordFilter, universityFilter, facultyFilter, yearFilter, campusFilter])

  const fetchStories = async () => {
    try {
      const params = new URLSearchParams()
      if (keywordFilter) params.append("keyword", keywordFilter)
      if (universityFilter) params.append("university", universityFilter)
      if (facultyFilter) params.append("faculty", facultyFilter)
      if (yearFilter) params.append("year", yearFilter)
      if (campusFilter) params.append("campus", campusFilter)

      const queryString = params.toString()
      const url = queryString ? `/api/stories?${queryString}` : "/api/stories"

      const res = await fetch(url)
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

  const clearFilters = () => {
    setKeywordFilter("")
    setUniversityFilter("")
    setFacultyFilter("")
    setYearFilter("")
    setCampusFilter("")
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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#044465' }}>
            loohcs志塾 合格者体験談
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            先輩の体験から学び、自分だけの合格ストーリーを描こう
          </p>
          {session?.user?.role === "USER" && (
            <Link
              href="/stories/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Award className="w-5 h-5" />
              体験談を投稿する
            </Link>
          )}
        </div>

        {/* フィルターセクション */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            style={{ background: 'linear-gradient(to right, #044465, #055a7a)', color: 'white' }}
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'フィルターを閉じる' : '絞り込み検索'}
          </button>

          {showFilters && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#bac9d0' }}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                  キーワード検索
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="大学名、学部、入試方式、高校名、名前、活動内容などで検索"
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    大学名
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="例：早稲田大学"
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    学部学科名
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="例：政治経済学部"
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    年度
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="例：2024"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    校舎
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={campusFilter}
                    onChange={(e) => setCampusFilter(e.target.value)}
                  >
                    <option value="">すべて</option>
                    <option value="武蔵小杉">武蔵小杉</option>
                    <option value="下北沢">下北沢</option>
                    <option value="自由が丘">自由が丘</option>
                    <option value="渋谷">渋谷</option>
                    <option value="オンライン">オンライン</option>
                    <option value="青葉台">青葉台</option>
                  </select>
                </div>
              </div>
              {(keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter) && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    フィルターをクリア
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              {keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter ? "条件に一致する体験談が見つかりませんでした" : "まだ体験談が投稿されていません"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter ? "フィルターを変更してみてください" : "最初の体験談を投稿してみませんか？"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                style={{ borderColor: '' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#bac9d0'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                {/* カードヘッダー - グラデーション背景 */}
                <div className="p-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-1 group-hover:scale-105 transition-transform">
                          {story.university}
                        </h2>
                        <p className="text-sm font-medium" style={{ color: '#bac9d0' }}>{story.faculty}</p>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {story.admissionType}
                      </div>
                      {story.year && (
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          {story.year}年度
                        </div>
                      )}
                      {(() => {
                        const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult)
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
                  {/* 投稿者情報 */}
                  <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                    {story.highSchoolName && (
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: '#044465' }} />
                        <p className="text-sm font-semibold" style={{ color: '#044465' }}>
                          {story.highSchoolName}
                        </p>
                      </div>
                    )}
                    {story.campus && (
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#044465' }} />
                        <p className="text-sm" style={{ color: '#044465' }}>
                          {story.campus}
                        </p>
                      </div>
                    )}
                    {story.authorName && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#055a7a' }} />
                        <p className="text-sm" style={{ color: '#044465' }}>
                          {story.authorName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 志 */}
                  {story.researchTheme && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">志</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {story.researchTheme}
                      </p>
                    </div>
                  )}

                  {/* 探究テーマタグ */}
                  {story.explorationThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">探究テーマ</p>
                      <div className="flex flex-wrap gap-2">
                        {story.explorationThemes.slice(0, 3).map((et) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-3 py-1 text-xs font-semibold rounded-full border"
                            style={{ color: '#044465', backgroundColor: '#f0f4f5', borderColor: '#bac9d0' }}
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

                  {/* 詳細を見るボタン */}
                  <div className="mt-5 flex items-center justify-between font-semibold text-sm" style={{ color: '#044465' }}>
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
