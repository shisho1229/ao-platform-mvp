"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ExplorationTheme {
  id: number
  name: string
  description: string
}

export default function NewStoryPage() {
  const router = useRouter()
  const [themes, setThemes] = useState<ExplorationTheme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // フォームデータ
  const [formData, setFormData] = useState({
    gender: "",
    highSchoolLevel: "LEVEL_2",
    highSchoolName: "",
    gradeAverage: "RANGE_3",
    admissionType: "",
    university: "",
    faculty: "",
    year: "",
    explorationThemeIds: [] as number[],
    researchTheme: "",
    researchMotivation: "",
    researchDetails: "",
    targetProfessor: "",
    hasSportsAchievement: false,
    sportsDetails: "",
    sportsAchievements: [] as string[],
    hasEnglishQualification: false,
    englishQualification: "",
    hasStudyAbroad: false,
    studyAbroadDetails: "",
    hasLeaderExperience: false,
    leaderExperienceDetails: "",
    hasContestAchievement: false,
    contestAchievementDetails: "",
    interviewQuestions: "",
    // 選考フロー
    selectionFlowType: "",
    firstRoundResult: "",
    secondRoundResult: "",
    documentPreparation: "",
    secondRoundPreparation: "",
    materials: "",
    adviceToJuniors: "",
  })

  const [concurrentApplications, setConcurrentApplications] = useState<
    Array<{ university: string; faculty: string; result: string }>
  >([])

  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    setFormData((prev) => ({
      ...prev,
      explorationThemeIds: prev.explorationThemeIds.includes(themeId)
        ? prev.explorationThemeIds.filter((id) => id !== themeId)
        : [...prev.explorationThemeIds, themeId],
    }))
  }

  const addConcurrentApplication = () => {
    setConcurrentApplications([
      ...concurrentApplications,
      { university: "", faculty: "", result: "ACCEPTED" },
    ])
  }

  const removeConcurrentApplication = (index: number) => {
    setConcurrentApplications(
      concurrentApplications.filter((_, i) => i !== index)
    )
  }

  const updateConcurrentApplication = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...concurrentApplications]
    updated[index] = { ...updated[index], [field]: value }
    setConcurrentApplications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // バリデーション
    if (!agreedToTerms) {
      setError("投稿内容の公開に同意してください")
      setIsLoading(false)
      return
    }

    if (formData.explorationThemeIds.length === 0) {
      setError("探究テーマを少なくとも1つ選択してください")
      setIsLoading(false)
      return
    }

    // 必須フィールドのチェック
    if (!formData.researchTheme?.trim()) {
      setError("探究テーマを入力してください")
      setIsLoading(false)
      return
    }

    if (!formData.researchMotivation?.trim()) {
      setError("きっかけを入力してください")
      setIsLoading(false)
      return
    }

    if (!formData.researchDetails?.trim()) {
      setError("探究活動の詳細を入力してください")
      setIsLoading(false)
      return
    }

    if (!formData.targetProfessor?.trim()) {
      setError("大学で学びたい教授を入力してください")
      setIsLoading(false)
      return
    }

    // チェックボックスがONの場合の詳細フィールドの必須チェック
    if (formData.hasSportsAchievement) {
      if (!formData.sportsDetails?.trim()) {
        setError("スポーツの競技名を入力してください")
        setIsLoading(false)
        return
      }
      if (formData.sportsAchievements.length === 0) {
        setError("スポーツ実績を少なくとも1つ選択してください")
        setIsLoading(false)
        return
      }
    }

    if (formData.hasEnglishQualification && !formData.englishQualification?.trim()) {
      setError("英語資格の内容を入力してください")
      setIsLoading(false)
      return
    }

    if (formData.hasStudyAbroad && !formData.studyAbroadDetails?.trim()) {
      setError("留学先と期間を入力してください")
      setIsLoading(false)
      return
    }

    if (formData.hasLeaderExperience && !formData.leaderExperienceDetails?.trim()) {
      setError("リーダー経験の詳細を入力してください")
      setIsLoading(false)
      return
    }

    if (formData.hasContestAchievement && !formData.contestAchievementDetails?.trim()) {
      setError("コンテスト実績の詳細を入力してください")
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        concurrentApplications:
          concurrentApplications.length > 0 ? concurrentApplications : undefined,
      }

      console.log("投稿データ:", payload)

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/stories")
      } else {
        const data = await res.json()
        console.error("投稿エラー:", data)
        setError(data.error || data.details || "投稿に失敗しました")
      }
    } catch (error) {
      console.error("投稿エラー (catch):", error)
      setError(`投稿に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          合格体験談を投稿
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
          {/* 基礎属性 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">基礎属性</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                性別（任意）
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="">未選択</option>
                <option value="MALE">男性</option>
                <option value="FEMALE">女性</option>
                <option value="OTHER">その他</option>
                <option value="PREFER_NOT_TO_SAY">回答しない</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                出身高校の偏差値帯 *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                value={formData.highSchoolLevel}
                onChange={(e) =>
                  setFormData({ ...formData, highSchoolLevel: e.target.value })
                }
              >
                <option value="LEVEL_1">~50</option>
                <option value="LEVEL_2">51-60</option>
                <option value="LEVEL_3">61-70</option>
                <option value="LEVEL_4">71~</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                高校名（任意）
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例：〇〇高等学校"
                value={formData.highSchoolName}
                onChange={(e) =>
                  setFormData({ ...formData, highSchoolName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                評定平均レンジ *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                value={formData.gradeAverage}
                onChange={(e) =>
                  setFormData({ ...formData, gradeAverage: e.target.value })
                }
              >
                <option value="RANGE_1">~3.0</option>
                <option value="RANGE_2">3.1-3.5</option>
                <option value="RANGE_3">3.6-4.0</option>
                <option value="RANGE_4">4.1-4.5</option>
                <option value="RANGE_5">4.6~</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                受験大学 *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value, faculty: "", admissionType: "" })
                }
              >
                <option value="">選択してください</option>
                <option value="慶應義塾大学">慶應義塾大学</option>
                <option value="その他">その他</option>
              </select>
            </div>

            {formData.university === "慶應義塾大学" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  学部 *
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  value={formData.faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, faculty: e.target.value })
                  }
                >
                  <option value="">選択してください</option>
                  <option value="法学部政治学科">法学部政治学科</option>
                  <option value="法学部法律学科">法学部法律学科</option>
                  <option value="総合政策学部">総合政策学部</option>
                  <option value="環境情報学部">環境情報学部</option>
                  <option value="文学部">文学部</option>
                </select>
              </div>
            )}

            {formData.university === "その他" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  学部 *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例：政治経済学部"
                  required
                  value={formData.faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, faculty: e.target.value })
                  }
                />
              </div>
            )}

            {formData.university === "慶應義塾大学" && formData.faculty && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  入試方式 *
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  value={formData.admissionType}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionType: e.target.value, selectionFlowType: e.target.value })
                  }
                >
                  <option value="">選択してください</option>
                  <option value="FIT入試">FIT入試</option>
                  <option value="春AO">春AO</option>
                  <option value="夏秋AO">夏秋AO</option>
                  <option value="自己推薦入試">自己推薦入試</option>
                </select>
              </div>
            )}

            {formData.university === "その他" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  入試方式 *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例：総合型選抜、学校推薦型選抜"
                  required
                  value={formData.admissionType}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionType: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                受験年度（任意）
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例：2024"
                min="2000"
                max="2030"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            {/* 合否情報 */}
            {formData.admissionType && (
              <div className="space-y-4 border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-medium text-gray-900">合否情報</h3>

                {formData.admissionType === "FIT入試" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        一次選考 *
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={formData.firstRoundResult}
                        onChange={(e) =>
                          setFormData({ ...formData, firstRoundResult: e.target.value })
                        }
                      >
                        <option value="">選択してください</option>
                        <option value="AB合格">AB合格</option>
                        <option value="A合格">A合格</option>
                        <option value="B合格">B合格</option>
                        <option value="不合格">不合格</option>
                      </select>
                    </div>

                    {(formData.firstRoundResult === "AB合格" || formData.firstRoundResult === "A合格" || formData.firstRoundResult === "B合格") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          最終選考 *
                        </label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                          value={formData.secondRoundResult}
                          onChange={(e) =>
                            setFormData({ ...formData, secondRoundResult: e.target.value })
                          }
                        >
                          <option value="">選択してください</option>
                          <option value="AB合格">AB合格</option>
                          <option value="A合格">A合格</option>
                          <option value="B合格">B合格</option>
                          <option value="不合格">不合格</option>
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        一次選考 *
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={formData.firstRoundResult}
                        onChange={(e) =>
                          setFormData({ ...formData, firstRoundResult: e.target.value })
                        }
                      >
                        <option value="">選択してください</option>
                        <option value="合格">合格</option>
                        <option value="不合格">不合格</option>
                        <option value="なし">なし</option>
                      </select>
                    </div>

                    {(formData.firstRoundResult === "合格" || formData.firstRoundResult === "なし") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          最終選考 *
                        </label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                          value={formData.secondRoundResult}
                          onChange={(e) =>
                            setFormData({ ...formData, secondRoundResult: e.target.value })
                          }
                        >
                          <option value="">選択してください</option>
                          <option value="合格">合格</option>
                          <option value="不合格">不合格</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 実績 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">実績</h2>

            {/* スポーツ実績 */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasSportsAchievement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasSportsAchievement: e.target.checked,
                      sportsDetails: e.target.checked ? formData.sportsDetails : "",
                      sportsAchievements: e.target.checked ? formData.sportsAchievements : [],
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  スポーツ実績あり
                </span>
              </label>
              {formData.hasSportsAchievement && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      競技名 *
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="例：サッカー、バスケットボール"
                      value={formData.sportsDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sportsDetails: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      実績（複数選択可）*
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "都道府県ベスト8",
                        "都道府県優勝・準優勝",
                        "地方大会出場（関東大会など）",
                        "地方大会優勝・準優勝",
                        "全国大会出場",
                        "全国ベスト32",
                        "全国ベスト16",
                        "全国ベスト8",
                        "全国ベスト4",
                        "全国3位",
                        "全国準優勝",
                        "全国優勝",
                        "世界大会出場",
                        "日本代表選出",
                      ].map((achievement) => (
                        <label
                          key={achievement}
                          className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.sportsAchievements.includes(achievement)}
                            onChange={(e) => {
                              const newAchievements = e.target.checked
                                ? [...formData.sportsAchievements, achievement]
                                : formData.sportsAchievements.filter((a) => a !== achievement)
                              setFormData({
                                ...formData,
                                sportsAchievements: newAchievements,
                              })
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{achievement}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 英語資格 */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasEnglishQualification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasEnglishQualification: e.target.checked,
                      englishQualification: e.target.checked ? formData.englishQualification : "",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  英語資格あり
                </span>
              </label>
              {formData.hasEnglishQualification && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    資格内容 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={2}
                    placeholder="例：英検準1級（高2取得）、TOEFL iBT 85点（高3取得）"
                    value={formData.englishQualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        englishQualification: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* 留学経験 */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasStudyAbroad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasStudyAbroad: e.target.checked,
                      studyAbroadDetails: e.target.checked ? formData.studyAbroadDetails : "",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  留学経験あり
                </span>
              </label>
              {formData.hasStudyAbroad && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    留学先と期間 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={2}
                    placeholder="例：アメリカ・カリフォルニア州（高1夏休み、3週間）"
                    value={formData.studyAbroadDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        studyAbroadDetails: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* リーダー経験 */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasLeaderExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasLeaderExperience: e.target.checked,
                      leaderExperienceDetails: e.target.checked ? formData.leaderExperienceDetails : "",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  リーダー経験あり
                </span>
              </label>
              {formData.hasLeaderExperience && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    詳細 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={2}
                    placeholder="例：生徒会副会長（高3）、サッカー部キャプテン（高3）"
                    value={formData.leaderExperienceDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaderExperienceDetails: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>

            {/* コンテスト実績 */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasContestAchievement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasContestAchievement: e.target.checked,
                      contestAchievementDetails: e.target.checked ? formData.contestAchievementDetails : "",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  コンテスト実績あり
                </span>
              </label>
              {formData.hasContestAchievement && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    詳細 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="例：U-22プログラミングコンテストでファイナリスト、科学オリンピック銀メダル"
                    value={formData.contestAchievementDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contestAchievementDetails: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* 探究テーマ */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              探究テーマ（複数選択可）*
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {themes.map((theme) => (
                <label
                  key={theme.id}
                  className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.explorationThemeIds.includes(theme.id)}
                    onChange={() => handleThemeToggle(theme.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {theme.name}
                    </span>
                    <p className="text-xs text-gray-500">{theme.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 探究・活動 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">探究・活動</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                探究テーマ *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="研究や探究活動のテーマを教えてください"
                required
                value={formData.researchTheme}
                onChange={(e) =>
                  setFormData({ ...formData, researchTheme: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                きっかけ *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="そのテーマに興味を持ったきっかけを教えてください"
                required
                value={formData.researchMotivation}
                onChange={(e) =>
                  setFormData({ ...formData, researchMotivation: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                探究活動の詳細 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="どのような方法で探究活動を行いましたか？具体的に記述してください"
                required
                value={formData.researchDetails}
                onChange={(e) =>
                  setFormData({ ...formData, researchDetails: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                大学で学びたい教授 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
                placeholder="大学でどの教授のもとで学びたいかを教えてください"
                required
                value={formData.targetProfessor}
                onChange={(e) =>
                  setFormData({ ...formData, targetProfessor: e.target.value })
                }
              />
            </div>
          </div>

          {/* 選考情報 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">選考情報</h2>

            {/* 選考フロー */}
            {(formData.admissionType === "春AO" || formData.admissionType === "夏秋AO" || formData.admissionType === "自己推薦入試") && (
              <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium text-gray-900">選考フロー</h3>

                {(formData.admissionType === "春AO" || formData.admissionType === "夏秋AO") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        一次選考（書類選考）の結果 *
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={formData.firstRoundResult}
                        onChange={(e) =>
                          setFormData({ ...formData, firstRoundResult: e.target.value })
                        }
                      >
                        <option value="">選択してください</option>
                        <option value="合格">合格</option>
                        <option value="不合格">不合格</option>
                      </select>
                    </div>

                    {formData.firstRoundResult === "合格" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          二次選考（面接）の結果 *
                        </label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                          value={formData.secondRoundResult}
                          onChange={(e) =>
                            setFormData({ ...formData, secondRoundResult: e.target.value })
                          }
                        >
                          <option value="">選択してください</option>
                          <option value="合格">合格</option>
                          <option value="不合格">不合格</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {formData.admissionType === "自己推薦入試" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        書類提出
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        書類を提出しました
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        論述試験の結果 *
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={formData.secondRoundResult}
                        onChange={(e) =>
                          setFormData({ ...formData, secondRoundResult: e.target.value })
                        }
                      >
                        <option value="">選択してください</option>
                        <option value="合格">合格</option>
                        <option value="不合格">不合格</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                面接で聞かれた内容（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="面接での質問内容を教えてください"
                value={formData.interviewQuestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interviewQuestions: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* 併願校 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              併願校（任意）
            </h2>
            {concurrentApplications.map((app, index) => (
              <div key={index} className="flex gap-4 items-start">
                <input
                  type="text"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="大学名"
                  value={app.university}
                  onChange={(e) =>
                    updateConcurrentApplication(index, "university", e.target.value)
                  }
                />
                <input
                  type="text"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="学部"
                  value={app.faculty}
                  onChange={(e) =>
                    updateConcurrentApplication(index, "faculty", e.target.value)
                  }
                />
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={app.result}
                  onChange={(e) =>
                    updateConcurrentApplication(index, "result", e.target.value)
                  }
                >
                  <option value="ACCEPTED">合格</option>
                  <option value="REJECTED">不合格</option>
                  <option value="PENDING">結果待ち</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeConcurrentApplication(index)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addConcurrentApplication}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 併願校を追加
            </button>
          </div>

          {/* 対策 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">対策</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                書類対策（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="志望理由書や活動報告書などの書類対策について教えてください"
                value={formData.documentPreparation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documentPreparation: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                二次対策（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="面接や論述試験などの二次対策について教えてください"
                value={formData.secondRoundPreparation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    secondRoundPreparation: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                使用教材・参考書（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="役に立った教材や参考書"
                value={formData.materials}
                onChange={(e) =>
                  setFormData({ ...formData, materials: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                後輩へのアドバイス（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="後輩に伝えたいことを自由に書いてください"
                value={formData.adviceToJuniors}
                onChange={(e) =>
                  setFormData({ ...formData, adviceToJuniors: e.target.value })
                }
              />
            </div>
          </div>

          {/* 同意チェックボックス */}
          <div className="border-t pt-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agree-terms" className="font-medium text-gray-700">
                  体験談の提供および広報活用に関する同意 *
                </label>
                <p className="text-gray-500 mt-1">
                  私は、私が提供する体験談・コメント・受験を通じた感想等について、loohcs志塾のWebサイト、SNS、パンフレット等の広報活動に活用されることに同意します。<br />
                  なお、広報において氏名・出身校・進学先・学年等の個人情報を使用する場合には、事前に本人の同意を得た上で、同意された範囲内でのみ使用されることを確認しています。<br />
                  本フォームを通じて提供される情報は、上記目的の範囲内で適切に管理されます。
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.explorationThemeIds.length === 0 || !agreedToTerms}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "投稿中..." : "投稿する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
