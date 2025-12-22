"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, Filter, GraduationCap, Users, BookOpen, ChevronDown, X } from "lucide-react"

interface ExplorationTheme {
  id: number
  name: string
  description: string
}

interface StoryWithScore {
  story: any
  score: number
  matchPercentage: number
}

export default function SearchPage() {
  const { data: session } = useSession()
  const [themes, setThemes] = useState<ExplorationTheme[]>([])
  const [results, setResults] = useState<StoryWithScore[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [searchCriteria, setSearchCriteria] = useState({
    highSchoolLevel: "",
    gradeAverage: "",
    admissionType: "",
    university: "",
    faculty: "",
    explorationThemeIds: [] as number[],
    hasSportsAchievement: false,
    englishLevel: "",
    hasStudyAbroad: false,
    hasLeaderExperience: false,
  })

  useEffect(() => {
    fetchThemes()
  }, [])

  // モバイルフィルターが開いているときはスクロールを無効化
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFilterOpen])

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/themes")
      if (res.ok) {
        const data = await res.json()
        setThemes(data)
      }
    } catch (error) {
      console.error("Error fetching themes:", error)
    }
  }

  const handleThemeToggle = (themeId: number) => {
    setSearchCriteria((prev) => ({
      ...prev,
      explorationThemeIds: prev.explorationThemeIds.includes(themeId)
        ? prev.explorationThemeIds.filter((id) => id !== themeId)
        : [...prev.explorationThemeIds, themeId],
    }))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    setHasSearched(true)
    setIsFilterOpen(false)

    try {
      const params = new URLSearchParams()
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value !== "" && value !== false && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","))
          } else {
            params.append(key, String(value))
          }
        }
      })

      const res = await fetch(`/api/stories/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearFilters = () => {
    setSearchCriteria({
      highSchoolLevel: "",
      gradeAverage: "",
      admissionType: "",
      university: "",
      faculty: "",
      explorationThemeIds: [],
      hasSportsAchievement: false,
      englishLevel: "",
      hasStudyAbroad: false,
      hasLeaderExperience: false,
    })
  }

  const hasActiveFilters = Object.entries(searchCriteria).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    return value !== ""
  })

  const labels = {
    highSchoolLevel: {
      LEVEL_1: "~50",
      LEVEL_2: "51-60",
      LEVEL_3: "61-70",
      LEVEL_4: "71~",
    },
    gradeAverage: {
      RANGE_1: "~3.0",
      RANGE_2: "3.1-3.5",
      RANGE_3: "3.6-4.0",
      RANGE_4: "4.1-4.5",
      RANGE_5: "4.6~",
    },
    englishLevel: {
      LV0: "なし",
      LV1: "基礎",
      LV2: "標準",
      LV3: "上位",
      LV4: "最上位",
    },
  }

  const getUniversityColor = (university: string) => {
    if (university.includes('慶應義塾大学') || university.includes('慶応義塾大学')) {
      return 'linear-gradient(to bottom right, #044465, #055a7a)';
    } else if (university.includes('早稲田大学')) {
      return 'linear-gradient(to bottom right, #8B1C1C, #A02020)';
    } else if (university.includes('上智大学')) {
      return 'linear-gradient(to bottom right, #C65D7B, #D4788F)';
    } else if (university.includes('青山学院大学')) {
      return 'linear-gradient(to bottom right, #1E6B4E, #228B5E)';
    } else if (university.includes('明治大学')) {
      return 'linear-gradient(to bottom right, #6B46C1, #7C3AED)';
    } else if (university.includes('立教大学')) {
      return 'linear-gradient(to bottom right, #312E81, #4338CA)';
    } else if (university.includes('中央大学')) {
      return 'linear-gradient(to bottom right, #B91C1C, #DC2626)';
    } else if (university.includes('学習院大学')) {
      return 'linear-gradient(to bottom right, #1E40AF, #2563EB)';
    }
    return 'linear-gradient(to bottom right, #044465, #055a7a)';
  };

  // 検索フォーム内容（モバイルとデスクトップで共通）
  const SearchFormContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          高校偏差値帯
        </label>
        <select
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={searchCriteria.highSchoolLevel}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              highSchoolLevel: e.target.value,
            })
          }
        >
          <option value="">選択してください</option>
          <option value="LEVEL_1">~50</option>
          <option value="LEVEL_2">51-60</option>
          <option value="LEVEL_3">61-70</option>
          <option value="LEVEL_4">71~</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          評定平均
        </label>
        <select
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={searchCriteria.gradeAverage}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              gradeAverage: e.target.value,
            })
          }
        >
          <option value="">選択してください</option>
          <option value="RANGE_1">~3.0</option>
          <option value="RANGE_2">3.1-3.5</option>
          <option value="RANGE_3">3.6-4.0</option>
          <option value="RANGE_4">4.1-4.5</option>
          <option value="RANGE_5">4.6~</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          志望大学
        </label>
        <select
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={searchCriteria.university}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              university: e.target.value,
            })
          }
        >
          <option value="">選択してください</option>
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

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          学部
        </label>
        <input
          type="text"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="例：政治経済学部"
          value={searchCriteria.faculty}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              faculty: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          入試方式
        </label>
        <input
          type="text"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="例：総合型選抜"
          value={searchCriteria.admissionType}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              admissionType: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          探究テーマ（複数選択可）
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
          {themes.map((theme) => (
            <label
              key={theme.id}
              className="flex items-start space-x-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={searchCriteria.explorationThemeIds.includes(theme.id)}
                onChange={() => handleThemeToggle(theme.id)}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{theme.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#044465' }}>
          英語レベル
        </label>
        <select
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={searchCriteria.englishLevel}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              englishLevel: e.target.value,
            })
          }
        >
          <option value="">選択してください</option>
          <option value="LV0">なし</option>
          <option value="LV1">基礎</option>
          <option value="LV2">標準</option>
          <option value="LV3">上位</option>
          <option value="LV4">最上位</option>
        </select>
      </div>

      <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
        <label className="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={searchCriteria.hasSportsAchievement}
            onChange={(e) =>
              setSearchCriteria({
                ...searchCriteria,
                hasSportsAchievement: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-gray-700">スポーツ実績あり</span>
        </label>

        <label className="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={searchCriteria.hasStudyAbroad}
            onChange={(e) =>
              setSearchCriteria({
                ...searchCriteria,
                hasStudyAbroad: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-gray-700">留学経験あり</span>
        </label>

        <label className="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={searchCriteria.hasLeaderExperience}
            onChange={(e) =>
              setSearchCriteria({
                ...searchCriteria,
                hasLeaderExperience: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-gray-700">リーダー経験あり</span>
        </label>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: '#bac9d0' }}>
        <button
          type="submit"
          disabled={isSearching}
          className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
        >
          {isSearching ? "検索中..." : "検索する"}
        </button>
      </div>

      {hasActiveFilters && (
        <div>
          <button
            type="button"
            onClick={clearFilters}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            クリア
          </button>
        </div>
      )}
    </form>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
            <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#044465' }}>
            あなたに近い合格者を探す
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            自分のプロフィールに近い先輩を見つけて参考にしよう
          </p>
        </div>

        {/* モバイル: フィルターボタン */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-md border"
            style={{ borderColor: '#bac9d0' }}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: '#044465' }} />
              <span className="text-sm font-semibold" style={{ color: '#044465' }}>検索条件を設定</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* モバイルフィルターパネル（オーバーレイ） */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl lg:hidden max-h-[85vh] overflow-hidden flex flex-col">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#bac9d0' }}>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" style={{ color: '#044465' }} />
                  <span className="text-lg font-bold" style={{ color: '#044465' }}>検索条件</span>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {/* フィルター内容 */}
              <div className="flex-1 overflow-y-auto p-4">
                <SearchFormContent isMobile={true} />
              </div>
            </div>
          </>
        )}

        {/* デスクトップ: 2カラムレイアウト */}
        <div className="flex gap-6">
          {/* 左側: 検索フォーム（デスクトップのみ） */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 border sticky top-6" style={{ borderColor: '#bac9d0' }}>
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" style={{ color: '#044465' }} />
                <h2 className="text-lg font-bold" style={{ color: '#044465' }}>
                  検索条件
                </h2>
              </div>
              <SearchFormContent />
            </div>
          </div>

          {/* 右側: 検索結果 */}
          <div className="flex-1 min-w-0">
            {!hasSearched ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border" style={{ borderColor: '#bac9d0' }}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#f0f4f5' }}>
                  <Search className="w-10 h-10" style={{ color: '#044465' }} />
                </div>
                <p className="text-gray-600 text-lg mb-2">
                  検索条件を設定してください
                </p>
                <p className="text-gray-500 text-sm">
                  あなたに近い合格者を探しましょう
                </p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
                <p className="text-gray-600 mt-4">検索中...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border" style={{ borderColor: '#bac9d0' }}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">
                  条件に合う体験記が見つかりませんでした
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  条件を変更してみてください
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {results.length}件の体験記が見つかりました
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map(({ story, score, matchPercentage }) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#bac9d0'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      {/* カードヘッダー */}
                      <div className="p-4 relative overflow-hidden" style={{ background: getUniversityColor(story.university) }}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-base font-bold text-white mb-1 group-hover:scale-105 transition-transform leading-tight truncate">
                                {story.university}
                              </h2>
                              <p className="text-xs font-medium leading-tight truncate" style={{ color: '#bac9d0' }}>{story.faculty}</p>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-center">
                                <span className="text-lg font-bold text-white">{matchPercentage}%</span>
                                <p className="text-xs text-white/80">類似度</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <div className="inline-block px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              {story.admissionType}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* カードボディ */}
                      <div className="p-4">
                        {/* ステータス情報 */}
                        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">高校偏差値:</span>
                              <span className="ml-1 font-semibold" style={{ color: '#044465' }}>
                                {labels.highSchoolLevel[story.highSchoolLevel as keyof typeof labels.highSchoolLevel] || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">評定平均:</span>
                              <span className="ml-1 font-semibold" style={{ color: '#044465' }}>
                                {labels.gradeAverage[story.gradeAverage as keyof typeof labels.gradeAverage] || '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 探究テーマタグ */}
                        {story.explorationThemes && story.explorationThemes.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {story.explorationThemes.slice(0, 2).map((et: any) => (
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
                        <div className="flex items-center justify-between font-semibold text-xs" style={{ color: '#044465' }}>
                          <span>詳しく見る</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
