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
    activityContent: "",
    activityResults: "",
    hasSportsAchievement: false,
    sportsAchievement: "",
    englishLevel: "LV0",
    englishDetail: "",
    hasStudyAbroad: false,
    hasLeaderExperience: false,
    leaderExperience: "",
    interviewQuestions: "",
    documentThemes: "",
    // 選考フロー
    selectionFlowType: "",
    firstRoundResult: "",
    secondRoundResult: "",
    preparationMethod: "",
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
                志望大学 *
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
                合格年度（任意）
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
          </div>

          {/* 実績 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">実績</h2>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasSportsAchievement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasSportsAchievement: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  スポーツ実績あり
                </span>
              </label>
              {formData.hasSportsAchievement && (
                <textarea
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  placeholder="スポーツ実績の詳細"
                  value={formData.sportsAchievement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sportsAchievement: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                英語資格レベル *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                value={formData.englishLevel}
                onChange={(e) =>
                  setFormData({ ...formData, englishLevel: e.target.value })
                }
              >
                <option value="LV0">なし</option>
                <option value="LV1">基礎（英検準2級程度）</option>
                <option value="LV2">標準（英検2級 / CEFR B1）</option>
                <option value="LV3">上位（英検準1級 / CEFR B2）</option>
                <option value="LV4">
                  最上位（英検1級 / IELTS6.5+ / TOEFL80+）
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                英語資格詳細（任意）
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例：英検2級（高2取得）、TOEIC 750点"
                value={formData.englishDetail}
                onChange={(e) =>
                  setFormData({ ...formData, englishDetail: e.target.value })
                }
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasStudyAbroad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasStudyAbroad: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  留学経験あり
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasLeaderExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasLeaderExperience: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  リーダー経験あり
                </span>
              </label>
              {formData.hasLeaderExperience && (
                <input
                  type="text"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例：生徒会副会長、部長など"
                  value={formData.leaderExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leaderExperience: e.target.value,
                    })
                  }
                />
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
                活動内容（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="どのような活動をしましたか？"
                value={formData.activityContent}
                onChange={(e) =>
                  setFormData({ ...formData, activityContent: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                活動実績（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="活動の成果や実績を教えてください"
                value={formData.activityResults}
                onChange={(e) =>
                  setFormData({ ...formData, activityResults: e.target.value })
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                提出書類の大まかなテーマ（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="志望理由書や活動報告書のテーマ"
                value={formData.documentThemes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documentThemes: e.target.value,
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
                対策方法（任意）
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="どのように対策しましたか？"
                value={formData.preparationMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparationMethod: e.target.value,
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
                  投稿内容の公開に同意します *
                </label>
                <p className="text-gray-500 mt-1">
                  この体験談は他のユーザーに公開されます。個人を特定できる情報（氏名、連絡先など）は含めないでください。
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
