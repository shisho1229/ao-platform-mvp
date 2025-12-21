"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditStoryPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    authorName: "",
    gender: "",
    highSchoolLevel: "LEVEL_2",
    highSchoolName: "",
    gradeAverage: "RANGE_3",
    campus: "",
    admissionType: "",
    university: "",
    faculty: "",
    year: "",
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
    selectionFlowType: "",
    firstRoundResult: "",
    secondRoundResult: "",
    documentPreparation: "",
    secondRoundPreparation: "",
    materials: "",
    adviceToJuniors: "",
  })

  const isStaffOrAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "STAFF"

  useEffect(() => {
    if (!isStaffOrAdmin) {
      router.push("/")
      return
    }

    fetchStory()
  }, [session, router])

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`)
      if (response.ok) {
        const story = await response.json()
        setFormData({
          authorName: story.authorName || "",
          gender: story.gender || "",
          highSchoolLevel: story.highSchoolLevel || "LEVEL_2",
          highSchoolName: story.highSchoolName || "",
          gradeAverage: story.gradeAverage || "RANGE_3",
          campus: story.campus || "",
          admissionType: story.admissionType || "",
          university: story.university || "",
          faculty: story.faculty || "",
          year: story.year?.toString() || "",
          researchTheme: story.researchTheme || "",
          researchMotivation: story.researchMotivation || "",
          researchDetails: story.researchDetails || "",
          targetProfessor: story.targetProfessor || "",
          hasSportsAchievement: story.hasSportsAchievement || false,
          sportsDetails: story.sportsDetails || "",
          sportsAchievements: story.sportsAchievements || [],
          hasEnglishQualification: story.hasEnglishQualification || false,
          englishQualification: story.englishQualification || "",
          hasStudyAbroad: story.hasStudyAbroad || false,
          studyAbroadDetails: story.studyAbroadDetails || "",
          hasLeaderExperience: story.hasLeaderExperience || false,
          leaderExperienceDetails: story.leaderExperienceDetails || "",
          hasContestAchievement: story.hasContestAchievement || false,
          contestAchievementDetails: story.contestAchievementDetails || "",
          interviewQuestions: story.interviewQuestions || "",
          selectionFlowType: story.selectionFlowType || "",
          firstRoundResult: story.firstRoundResult || "",
          secondRoundResult: story.secondRoundResult || "",
          documentPreparation: story.documentPreparation || "",
          secondRoundPreparation: story.secondRoundPreparation || "",
          materials: story.materials || "",
          adviceToJuniors: story.adviceToJuniors || "",
        })
      } else {
        setError("体験談の取得に失敗しました")
      }
    } catch (error) {
      console.error("Error fetching story:", error)
      setError("体験談の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
      }

      const response = await fetch(`/api/admin/stories/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("体験談を更新しました")
        router.push("/admin/stories")
      } else {
        const data = await response.json()
        setError(data.error || "更新に失敗しました")
      }
    } catch (error) {
      console.error("Update error:", error)
      setError("更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isStaffOrAdmin) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 text-gray-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/stories"
          className="inline-flex items-center text-sm font-semibold mb-6 px-4 py-2 rounded-lg transition-all"
          style={{ color: "#044465" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          投稿管理に戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">体験談を編集</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
          {/* 基礎情報 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">基礎情報</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">大学</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">学部</label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">入試方式</label>
                <input
                  type="text"
                  value={formData.admissionType}
                  onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">受験年度</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">一次選考結果</label>
                <input
                  type="text"
                  value={formData.firstRoundResult}
                  onChange={(e) => setFormData({ ...formData, firstRoundResult: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例：A合格、AB合格、合格"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">最終選考結果</label>
                <input
                  type="text"
                  value={formData.secondRoundResult}
                  onChange={(e) => setFormData({ ...formData, secondRoundResult: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例：合格、不合格"
                />
              </div>
            </div>
          </div>

          {/* 探究・活動 */}
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900">探究・活動</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">探究テーマ</label>
              <textarea
                value={formData.researchTheme}
                onChange={(e) => setFormData({ ...formData, researchTheme: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">きっかけ</label>
              <textarea
                value={formData.researchMotivation}
                onChange={(e) => setFormData({ ...formData, researchMotivation: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">探究活動の詳細</label>
              <textarea
                value={formData.researchDetails}
                onChange={(e) => setFormData({ ...formData, researchDetails: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">大学で学びたい教授</label>
              <textarea
                value={formData.targetProfessor}
                onChange={(e) => setFormData({ ...formData, targetProfessor: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 対策 */}
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900">対策</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">書類対策</label>
              <textarea
                value={formData.documentPreparation}
                onChange={(e) => setFormData({ ...formData, documentPreparation: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">二次対策</label>
              <textarea
                value={formData.secondRoundPreparation}
                onChange={(e) => setFormData({ ...formData, secondRoundPreparation: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">使用教材・参考書</label>
              <textarea
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 後輩へのアドバイス */}
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900">後輩へのアドバイス</h2>

            <div>
              <textarea
                value={formData.adviceToJuniors}
                onChange={(e) => setFormData({ ...formData, adviceToJuniors: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <Link
              href="/admin/stories"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "更新中..." : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
