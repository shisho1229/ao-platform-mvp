"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setHasSearched(true)

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          あなたに近い合格者を探す
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 検索フォーム */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                検索条件
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    高校偏差値帯
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    評定平均
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入試方式
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    志望大学
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="例：早稲田大学"
                    value={searchCriteria.university}
                    onChange={(e) =>
                      setSearchCriteria({
                        ...searchCriteria,
                        university: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    学部
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    探究テーマ（複数選択可）
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {themes.map((theme) => (
                      <label
                        key={theme.id}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={searchCriteria.explorationThemeIds.includes(
                            theme.id
                          )}
                          onChange={() => handleThemeToggle(theme.id)}
                          className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{theme.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    英語レベル
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
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

                  <label className="flex items-center space-x-2 text-sm">
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

                  <label className="flex items-center space-x-2 text-sm">
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

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? "検索中..." : "検索する"}
                </button>
              </form>
            </div>
          </div>

          {/* 検索結果 */}
          <div className="lg:col-span-2">
            {!hasSearched ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">
                  左側の検索条件を入力して、あなたに近い合格者を探しましょう
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">
                  条件に合う体験談が見つかりませんでした
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {results.length}件の体験談が見つかりました
                </p>
                {results.map(({ story, score, matchPercentage }) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {story.university} {story.faculty}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {story.admissionType}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          <span className="text-lg font-bold">
                            {matchPercentage}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          類似度スコア: {score}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="text-gray-500">高校偏差値:</span>
                        <span className="ml-2 font-medium">
                          {labels.highSchoolLevel[story.highSchoolLevel as keyof typeof labels.highSchoolLevel]}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">評定平均:</span>
                        <span className="ml-2 font-medium">
                          {labels.gradeAverage[story.gradeAverage as keyof typeof labels.gradeAverage]}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">英語レベル:</span>
                        <span className="ml-2 font-medium">
                          {labels.englishLevel[story.englishLevel as keyof typeof labels.englishLevel]}
                        </span>
                      </div>
                    </div>

                    {story.explorationThemes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {story.explorationThemes.slice(0, 3).map((et: any) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded"
                          >
                            {et.theme.name}
                          </span>
                        ))}
                      </div>
                    )}
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
