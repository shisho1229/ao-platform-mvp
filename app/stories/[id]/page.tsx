"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  gender: string | null
  highSchoolLevel: string
  gradeAverage: string
  admissionType: string
  englishLevel: string
  englishDetail: string | null
  hasStudyAbroad: boolean
  hasSportsAchievement: boolean
  sportsAchievement: string | null
  hasLeaderExperience: boolean
  leaderExperience: string | null
  activityContent: string | null
  activityResults: string | null
  interviewQuestions: string | null
  documentThemes: string | null
  preparationMethod: string | null
  materials: string | null
  adviceToJuniors: string | null
  explorationThemes: Array<{
    theme: {
      id: number
      name: string
      description: string
    }
  }>
  concurrentApplications: Array<{
    university: string
    faculty: string
    result: string
  }>
  createdAt: string
}

export default function StoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchStory(params.id as string)
    }
  }, [params.id])

  const fetchStory = async (id: string) => {
    try {
      const res = await fetch(`/api/stories/${id}`)
      if (res.ok) {
        const data = await res.json()
        setStory(data)
      }
    } catch (error) {
      console.error("Error fetching story:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkFavoriteStatus = async (storyId: string) => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const favorites = await res.json()
        const isFav = favorites.some((fav: any) => fav.storyId === storyId)
        setIsFavorited(isFav)
      }
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!story || !session?.user) return

    setIsFavoriteLoading(true)
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const res = await fetch(`/api/stories/${story.id}/favorite`, {
        method,
      })

      if (res.ok) {
        setIsFavorited(!isFavorited)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  useEffect(() => {
    if (story && session?.user) {
      checkFavoriteStatus(story.id)
    }
  }, [story, session])

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
      LV1: "基礎（英検準2級程度）",
      LV2: "標準（英検2級 / CEFR B1）",
      LV3: "上位（英検準1級 / CEFR B2）",
      LV4: "最上位（英検1級 / IELTS6.5+ / TOEFL80+）",
    },
    gender: {
      MALE: "男性",
      FEMALE: "女性",
      OTHER: "その他",
      PREFER_NOT_TO_SAY: "回答しない",
    },
    result: {
      ACCEPTED: "合格",
      REJECTED: "不合格",
      PENDING: "結果待ち",
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">体験談が見つかりません</p>
          <Link
            href="/stories"
            className="text-blue-600 hover:text-blue-800"
          >
            体験談一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/stories"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6"
        >
          ← 体験談一覧に戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* ヘッダー */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {story.university} {story.faculty}
              </h1>
              <p className="text-gray-600">{story.admissionType}</p>
            </div>
            {session?.user && (
              <button
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                className={`flex-shrink-0 ml-4 p-3 rounded-full transition-all duration-200 ${
                  isFavorited
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <Heart
                  className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`}
                />
              </button>
            )}
          </div>

          {/* 基礎属性 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基礎属性</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {story.gender && (
                <div>
                  <span className="text-gray-600">性別:</span>
                  <span className="ml-2 font-medium">
                    {labels.gender[story.gender as keyof typeof labels.gender]}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">高校偏差値帯:</span>
                <span className="ml-2 font-medium">
                  {labels.highSchoolLevel[story.highSchoolLevel as keyof typeof labels.highSchoolLevel]}
                </span>
              </div>
              <div>
                <span className="text-gray-600">評定平均:</span>
                <span className="ml-2 font-medium">
                  {labels.gradeAverage[story.gradeAverage as keyof typeof labels.gradeAverage]}
                </span>
              </div>
              <div>
                <span className="text-gray-600">英語レベル:</span>
                <span className="ml-2 font-medium">
                  {labels.englishLevel[story.englishLevel as keyof typeof labels.englishLevel]}
                </span>
              </div>
              {story.englishDetail && (
                <div className="col-span-2">
                  <span className="text-gray-600">英語資格詳細:</span>
                  <span className="ml-2 font-medium">{story.englishDetail}</span>
                </div>
              )}
            </div>
          </div>

          {/* 探究テーマ */}
          {story.explorationThemes.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                探究テーマ
              </h2>
              <div className="flex flex-wrap gap-2">
                {story.explorationThemes.map((et) => (
                  <span
                    key={et.theme.id}
                    className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded"
                  >
                    {et.theme.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 活動内容 */}
          {(story.activityContent || story.activityResults) && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                探究・活動
              </h2>
              {story.activityContent && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">活動内容</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.activityContent}
                  </p>
                </div>
              )}
              {story.activityResults && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">活動実績</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.activityResults}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 実績 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">実績</h2>
            <div className="space-y-3">
              {story.hasSportsAchievement && story.sportsAchievement && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    スポーツ実績
                  </h3>
                  <p className="text-gray-700">{story.sportsAchievement}</p>
                </div>
              )}
              {story.hasLeaderExperience && story.leaderExperience && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    リーダー経験
                  </h3>
                  <p className="text-gray-700">{story.leaderExperience}</p>
                </div>
              )}
              <div className="flex gap-2 text-sm">
                {story.hasStudyAbroad && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                    留学経験あり
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 併願校 */}
          {story.concurrentApplications.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                併願校
              </h2>
              <div className="space-y-2">
                {story.concurrentApplications.map((app, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {app.university} {app.faculty}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        app.result === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : app.result === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {labels.result[app.result as keyof typeof labels.result]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 選考情報 */}
          {(story.interviewQuestions || story.documentThemes) && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                選考情報
              </h2>
              {story.interviewQuestions && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    面接で聞かれた内容
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.interviewQuestions}
                  </p>
                </div>
              )}
              {story.documentThemes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    提出書類の大まかなテーマ
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.documentThemes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 対策 */}
          {(story.preparationMethod || story.materials) && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">対策</h2>
              {story.preparationMethod && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">対策方法</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.preparationMethod}
                  </p>
                </div>
              )}
              {story.materials && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    使用教材・参考書
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.materials}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 後輩へのアドバイス */}
          {story.adviceToJuniors && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                後輩へのアドバイス
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {story.adviceToJuniors}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
