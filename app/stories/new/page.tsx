"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

interface ExplorationTheme {
  id: number
  name: string
  description: string
}

// 大学リスト
const UNIVERSITIES = [
  "慶應義塾大学",
  "早稲田大学",
  "上智大学",
  "青山学院大学",
  "明治大学",
  "立教大学",
  "中央大学",
  "学習院大学",
]

// 大学ごとの学部リスト
const FACULTY_OPTIONS: Record<string, string[]> = {
  "慶應義塾大学": [
    "法学部政治学科",
    "法学部法律学科",
    "総合政策学部",
    "環境情報学部",
    "文学部",
    "経済学部",
    "商学部",
    "理工学部",
    "医学部",
    "薬学部",
    "看護医療学部",
  ],
  "早稲田大学": [
    "政治経済学部",
    "法学部",
    "文学部",
    "文化構想学部",
    "教育学部",
    "商学部",
    "社会科学部",
    "人間科学部",
    "スポーツ科学部",
    "国際教養学部",
    "基幹理工学部",
    "創造理工学部",
    "先進理工学部",
  ],
  "上智大学": [
    "神学部",
    "文学部",
    "総合人間科学部",
    "法学部",
    "経済学部",
    "外国語学部",
    "総合グローバル学部",
    "国際教養学部",
    "理工学部",
  ],
  "青山学院大学": [
    "文学部",
    "教育人間科学部",
    "経済学部",
    "法学部",
    "経営学部",
    "国際政治経済学部",
    "総合文化政策学部",
    "理工学部",
    "社会情報学部",
    "地球社会共生学部",
    "コミュニティ人間科学部",
  ],
  "明治大学": [
    "法学部",
    "商学部",
    "政治経済学部",
    "文学部",
    "理工学部",
    "農学部",
    "経営学部",
    "情報コミュニケーション学部",
    "国際日本学部",
    "総合数理学部",
  ],
  "立教大学": [
    "文学部",
    "異文化コミュニケーション学部",
    "経済学部",
    "経営学部",
    "理学部",
    "社会学部",
    "法学部",
    "観光学部",
    "コミュニティ福祉学部",
    "現代心理学部",
    "スポーツウエルネス学部",
    "グローバル・リベラルアーツ・プログラム",
  ],
  "中央大学": [
    "法学部",
    "経済学部",
    "商学部",
    "理工学部",
    "文学部",
    "総合政策学部",
    "国際経営学部",
    "国際情報学部",
  ],
  "学習院大学": [
    "法学部",
    "経済学部",
    "文学部",
    "理学部",
    "国際社会科学部",
  ],
}

// 大学ごとの入試方式
const ADMISSION_TYPE_OPTIONS: Record<string, string[]> = {
  "慶應義塾大学": ["FIT入試", "春AO", "夏秋AO", "自己推薦入試"],
  "早稲田大学": ["AO入試", "指定校推薦", "自己推薦入試", "グローバル入試"],
  "上智大学": ["公募制推薦入試", "カトリック高等学校対象特別入試", "海外就学経験者入試", "国際バカロレア入試"],
  "青山学院大学": ["自己推薦入試", "スポーツ推薦入試", "海外就学経験者入試"],
  "明治大学": ["AO入試", "自己推薦特別入試", "公募制特別入試", "スポーツ特別入試"],
  "立教大学": ["自由選抜入試", "アスリート選抜入試", "国際コース選抜入試"],
  "中央大学": ["自己推薦入試", "スポーツ推薦入試", "英語運用能力特別入試"],
  "学習院大学": ["公募制推薦入試", "AO入試"],
}

export default function NewStoryPage() {
  const router = useRouter()
  const [themes, setThemes] = useState<ExplorationTheme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // フォームデータ
  const [formData, setFormData] = useState({
    authorName: "",
    isAnonymous: false,
    gender: "",
    highSchoolLevel: "LEVEL_2",
    highSchoolName: "",
    gradeAverage: "RANGE_3",
    campus: "",
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
    // 選考フロー
    selectionFlowType: "",
    firstRoundResult: "",
    secondRoundResult: "",
    documentPreparation: "",
    secondRoundPreparation: "",
    materials: "",
    adviceToJuniors: "",
  })

  // 面接質問（個別入力）
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState("")

  const [concurrentApplications, setConcurrentApplications] = useState<
    Array<{ university: string; faculty: string; result: string }>
  >([])

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const STORAGE_KEY = "story_draft"

  useEffect(() => {
    fetchThemes()

    // localStorageから下書きを復元
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setFormData(draft.formData || formData)
        setConcurrentApplications(draft.concurrentApplications || [])
        setInterviewQuestions(draft.interviewQuestions || [])
      } catch (error) {
        console.error("下書きの復元に失敗しました:", error)
      }
    }
  }, [])

  // formDataが変更されたら自動保存
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const draft = {
        formData,
        concurrentApplications,
        interviewQuestions,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    }, 1000) // 1秒のデバウンス

    return () => clearTimeout(saveTimer)
  }, [formData, concurrentApplications, interviewQuestions])

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

  // 面接質問の追加
  const addInterviewQuestion = () => {
    if (newQuestion.trim()) {
      setInterviewQuestions([...interviewQuestions, newQuestion.trim()])
      setNewQuestion("")
    }
  }

  // 面接質問の削除
  const removeInterviewQuestion = (index: number) => {
    setInterviewQuestions(interviewQuestions.filter((_, i) => i !== index))
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

    // 必須フィールドのチェック
    if (!formData.authorName?.trim()) {
      setError("名前を入力してください")
      setIsLoading(false)
      return
    }

    if (!formData.highSchoolName?.trim()) {
      setError("高校名を入力してください")
      setIsLoading(false)
      return
    }

    if (!formData.campus?.trim()) {
      setError("所属校舎を選択してください")
      setIsLoading(false)
      return
    }

    if (!formData.university?.trim()) {
      setError("受験大学を選択してください")
      setIsLoading(false)
      return
    }

    if (formData.explorationThemeIds.length === 0) {
      setError("探究テーマを少なくとも1つ選択してください")
      setIsLoading(false)
      return
    }

    if (!formData.researchTheme?.trim()) {
      setError("志を入力してください")
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

    if (interviewQuestions.length === 0) {
      setError("面接で聞かれた質問を少なくとも1つ入力してください")
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
        // 面接質問をJSON文字列として保存
        interviewQuestions: JSON.stringify(interviewQuestions),
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
        // 投稿成功時に下書きを削除
        localStorage.removeItem(STORAGE_KEY)
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

  const handleSaveDraft = async () => {
    setError("")
    setSuccessMessage("")
    setIsSavingDraft(true)

    try {
      const payload = {
        ...formData,
        status: "DRAFT", // 下書きステータスで保存
        interviewQuestions: JSON.stringify(interviewQuestions),
        concurrentApplications:
          concurrentApplications.length > 0 ? concurrentApplications : undefined,
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccessMessage("下書きを保存しました")
        // 3秒後にマイ投稿ページへ
        setTimeout(() => {
          router.push("/my-stories")
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || "下書きの保存に失敗しました")
      }
    } catch (error) {
      setError(`下書きの保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsSavingDraft(false)
    }
  }

  // 選択された大学の学部リスト
  const facultyOptions = formData.university ? FACULTY_OPTIONS[formData.university] || [] : []
  // 選択された大学の入試方式リスト
  const admissionTypeOptions = formData.university ? ADMISSION_TYPE_OPTIONS[formData.university] || [] : []

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          合格体験記を投稿
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-white p-4 sm:p-8 rounded-lg shadow">
          {/* 基礎属性 */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">基礎属性</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                名前 *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                placeholder="例：山田 太郎"
                required
                value={formData.authorName}
                onChange={(e) =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
              />
            </div>

            {/* 匿名表示オプション */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    匿名での表示を希望する
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    チェックすると、体験記の公開時に名前が「匿名」と表示されます。<br />
                    ※管理者のデータベースには本名が記録されます。
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                性別（任意）
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                高校名 *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                placeholder="例：〇〇高等学校"
                required
                value={formData.highSchoolName}
                onChange={(e) =>
                  setFormData({ ...formData, highSchoolName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                所属校舎 *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                required
                value={formData.campus}
                onChange={(e) =>
                  setFormData({ ...formData, campus: e.target.value })
                }
              >
                <option value="">選択してください</option>
                <option value="武蔵小杉">武蔵小杉</option>
                <option value="下北沢">下北沢</option>
                <option value="渋谷">渋谷</option>
                <option value="オンライン">オンライン</option>
                <option value="青葉台">青葉台</option>
                <option value="自由が丘">自由が丘</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                評定平均レンジ *
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                required
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value, faculty: "", admissionType: "" })
                }
              >
                <option value="">選択してください</option>
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            {formData.university && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  学部 *
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  required
                  value={formData.faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, faculty: e.target.value })
                  }
                >
                  <option value="">選択してください</option>
                  {facultyOptions.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.university && formData.faculty && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  入試方式 *
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  required
                  value={formData.admissionType}
                  onChange={(e) =>
                    setFormData({ ...formData, admissionType: e.target.value, selectionFlowType: e.target.value })
                  }
                >
                  <option value="">選択してください</option>
                  {admissionTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                受験年度 *
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                placeholder="例：2024"
                min="2000"
                max="2030"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            {/* 合否情報 */}
            {formData.admissionType && (
              <div className="space-y-4 border-l-4 border-green-500 pl-3 sm:pl-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">合否情報</h3>

                {formData.university === "慶應義塾大学" && formData.admissionType === "FIT入試" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        一次選考 *
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">実績</h2>

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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  スポーツ実績あり
                </span>
              </label>
              {formData.hasSportsAchievement && (
                <div className="ml-4 sm:ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      競技名 *
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  英語資格あり
                </span>
              </label>
              {formData.hasEnglishQualification && (
                <div className="ml-4 sm:ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    資格内容 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  留学経験あり
                </span>
              </label>
              {formData.hasStudyAbroad && (
                <div className="ml-4 sm:ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    留学先と期間 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  リーダー経験あり
                </span>
              </label>
              {formData.hasLeaderExperience && (
                <div className="ml-4 sm:ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    詳細 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  コンテスト実績あり
                </span>
              </label>
              {formData.hasContestAchievement && (
                <div className="ml-4 sm:ml-6">
                  <label className="block text-sm font-medium text-gray-700">
                    詳細 *
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              探究テーマ（複数選択可）*
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {themes.map((theme) => (
                <label
                  key={theme.id}
                  className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.explorationThemeIds.includes(theme.id)}
                    onChange={() => handleThemeToggle(theme.id)}
                    className="h-5 w-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900">
                      {theme.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{theme.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 探究・活動 */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">探究・活動</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                志 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                rows={3}
                placeholder="あなたの志を教えてください"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">選考情報</h2>

            {/* 面接で聞かれた質問 - 個別入力形式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                面接で聞かれた質問 *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                面接で聞かれた質問を1つずつ追加してください
              </p>

              {/* 追加済みの質問リスト */}
              {interviewQuestions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {interviewQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-sm text-gray-700">{question}</p>
                      <button
                        type="button"
                        onClick={() => removeInterviewQuestion(index)}
                        className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 新しい質問の入力 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addInterviewQuestion()
                    }
                  }}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  placeholder="例：なぜこの学部を志望しましたか？"
                />
                <button
                  type="button"
                  onClick={addInterviewQuestion}
                  disabled={!newQuestion.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">追加</span>
                </button>
              </div>
            </div>
          </div>

          {/* 併願校 */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              併願校（任意）
            </h2>
            {concurrentApplications.map((app, index) => (
              <div key={index} className="space-y-2 sm:space-y-0 sm:flex sm:gap-4 sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <input
                  type="text"
                  className="w-full sm:flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  placeholder="大学名"
                  value={app.university}
                  onChange={(e) =>
                    updateConcurrentApplication(index, "university", e.target.value)
                  }
                />
                <input
                  type="text"
                  className="w-full sm:flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  placeholder="学部"
                  value={app.faculty}
                  onChange={(e) =>
                    updateConcurrentApplication(index, "faculty", e.target.value)
                  }
                />
                <div className="flex gap-2 sm:gap-4 items-center">
                  <select
                    className="flex-1 sm:flex-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800 whitespace-nowrap"
                  >
                    削除
                  </button>
                </div>
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
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">対策</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                書類対策 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                rows={4}
                placeholder="志望理由書や活動報告書などの書類対策について教えてください"
                required
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
                二次対策 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                rows={4}
                placeholder="面接や論述試験などの二次対策について教えてください"
                required
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
                使用教材・参考書 *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                rows={3}
                placeholder="役に立った教材や参考書"
                required
                value={formData.materials}
                onChange={(e) =>
                  setFormData({ ...formData, materials: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                後輩へのアドバイス *
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                rows={4}
                placeholder="後輩に伝えたいことを自由に書いてください"
                required
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
                  className="w-5 h-5 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agree-terms" className="font-medium text-gray-700">
                  体験記の提供および広報活用に関する同意 *
                </label>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                  私は、私が提供する体験記・コメント・受験を通じた感想等について、loohcs志塾のWebサイト、SNS、パンフレット等の広報活動に活用されることに同意します。<br />
                  なお、広報において氏名・出身校・進学先・学年等の個人情報を使用する場合には、事前に本人の同意を得た上で、同意された範囲内でのみ使用されることを確認しています。<br />
                  本フォームを通じて提供される情報は、上記目的の範囲内で適切に管理されます。
                </p>
              </div>
            </div>
          </div>

          {/* ボタンエリア */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isLoading}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
            >
              {isSavingDraft ? "保存中..." : "下書き保存"}
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading || isSavingDraft || formData.explorationThemeIds.length === 0 || !agreedToTerms}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "投稿中..." : "投稿する"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
