"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { BookOpen, Users, GraduationCap, Filter } from "lucide-react"

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
  const [keywordInput, setKeywordInput] = useState("")
  const [keywordFilter, setKeywordFilter] = useState("")
  const [universityFilter, setUniversityFilter] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [campusFilter, setCampusFilter] = useState("")

  useEffect(() => {
    fetchStories()
  }, [keywordFilter, universityFilter, facultyFilter, yearFilter, campusFilter])

  const handleKeywordSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setKeywordFilter(keywordInput)
  }

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
    setKeywordInput("")
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#044465' }}>
            loohcs志塾 合格者体験記
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            先輩の体験から学び、自分だけの合格ストーリーを描こう
          </p>
        </div>

        {/* 2カラムレイアウト: 左側フィルター、右側結果 */}
        <div className="flex gap-6">
          {/* 左側: 検索・絞り込みサイドバー */}
          <div className="w-80 flex-shrink-0">
            {/* キーワード検索 */}
            <div className="bg-white rounded-xl shadow-md p-4 border mb-4" style={{ borderColor: '#bac9d0' }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                キーワード検索
              </label>
              <form onSubmit={handleKeywordSearch} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="学部、入試方式、高校名など"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
                >
                  検索
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border sticky top-6" style={{ borderColor: '#bac9d0' }}>
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" style={{ color: '#044465' }} />
                <h2 className="text-lg font-bold" style={{ color: '#044465' }}>
                  絞り込み検索
                </h2>
              </div>

              <div className="space-y-4">
                {/* 大学名（選択式） */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    大学名
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                  >
                    <option value="">すべて</option>
                    <option value="慶應義塾大学">慶應義塾大学</option>
                    <option value="早稲田大学">早稲田大学</option>
                    <option value="上智大学">上智大学</option>
                    <option value="青山学院大学">青山学院大学</option>
                    <option value="明治大学">明治大学</option>
                    <option value="立教大学">立教大学</option>
                    <option value="中央大学">中央大学</option>
                    <option value="学習院大学">学習院大学</option>
                  </select>
                </div>

                {/* 学部学科名 */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    学部学科名
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="例：政治経済学部"
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                  />
                </div>

                {/* 年度 */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    年度
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="例：2024"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                  />
                </div>

                {/* 校舎 */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
                    校舎
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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

              {/* 検索ボタン */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#bac9d0' }}>
                <button
                  onClick={fetchStories}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
                >
                  検索
                </button>
              </div>

              {/* フィルタークリアボタン */}
              {(keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter) && (
                <div className="mt-3">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    クリア
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右側: 検索結果 */}
          <div className="flex-1">

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
              {keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter ? "条件に一致する体験記が見つかりませんでした" : "まだ体験記が投稿されていません"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {keywordFilter || universityFilter || facultyFilter || yearFilter || campusFilter ? "フィルターを変更してみてください" : "最初の体験記を投稿してみませんか？"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                <div className="p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-base font-bold text-white mb-1 group-hover:scale-105 transition-transform leading-tight">
                          {story.university}
                        </h2>
                        <p className="text-xs font-medium leading-tight" style={{ color: '#bac9d0' }}>{story.faculty}</p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <div className="inline-block px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {story.admissionType}
                      </div>
                      {story.year && (
                        <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          {story.year}年度
                        </div>
                      )}
                      {(() => {
                        const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult)
                        return result ? (
                          <div className={`inline-block px-2 py-0.5 ${result.color} text-white text-xs font-semibold rounded-full`}>
                            {result.label}
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>

                {/* カードボディ */}
                <div className="p-4">
                  {/* 投稿者情報 */}
                  <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                    {story.highSchoolName && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#044465' }} />
                        <p className="text-xs font-semibold leading-tight" style={{ color: '#044465' }}>
                          {story.highSchoolName}
                        </p>
                      </div>
                    )}
                    {story.campus && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#044465' }} />
                        <p className="text-xs leading-tight" style={{ color: '#044465' }}>
                          {story.campus}
                        </p>
                      </div>
                    )}
                    {story.authorName && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#055a7a' }} />
                        <p className="text-xs leading-tight" style={{ color: '#044465' }}>
                          {story.authorName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 志 */}
                  {story.researchTheme && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">志</p>
                      <p className="text-xs text-gray-700 line-clamp-2 leading-tight">
                        {story.researchTheme}
                      </p>
                    </div>
                  )}

                  {/* 探究テーマタグ */}
                  {story.explorationThemes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">探究テーマ</p>
                      <div className="flex flex-wrap gap-1">
                        {story.explorationThemes.slice(0, 2).map((et) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full border"
                            style={{ color: '#044465', backgroundColor: '#f0f4f5', borderColor: '#bac9d0' }}
                          >
                            {et.theme.name}
                          </span>
                        ))}
                        {story.explorationThemes.length > 2 && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                            +{story.explorationThemes.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 詳細を見るボタン */}
                  <div className="mt-3 flex items-center justify-between font-semibold text-xs" style={{ color: '#044465' }}>
                    <span>詳しく見る</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  )
}
