"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart, ArrowLeft, GraduationCap, Award, Globe, Users, BookOpen, FileText, Target, ExternalLink, Edit } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  authorId: string
  authorName?: string
  gender: string | null
  highSchoolLevel: string
  highSchoolName?: string
  gradeAverage: string
  campus?: string
  admissionType: string
  year?: number
  documentsUrl?: string
  author?: {
    id: string
    name: string | null
    campus: string | null
  }

  // 探究・活動
  researchTheme?: string
  researchMotivation?: string
  researchDetails?: string
  targetProfessor?: string

  // 実績
  hasSportsAchievement: boolean
  sportsDetails?: string
  sportsAchievements?: string[]
  hasEnglishQualification: boolean
  englishQualification?: string
  hasStudyAbroad: boolean
  studyAbroadDetails?: string
  hasLeaderExperience: boolean
  leaderExperienceDetails?: string
  hasContestAchievement: boolean
  contestAchievementDetails?: string

  // 選考情報
  firstRoundResult?: string
  secondRoundResult?: string
  interviewQuestions?: string

  // 対策
  documentPreparation?: string
  secondRoundPreparation?: string
  materials?: string

  // その他
  adviceToJuniors?: string
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
  const [showDocumentsUrlModal, setShowDocumentsUrlModal] = useState(false)
  const [documentsUrlInput, setDocumentsUrlInput] = useState("")
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false)

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

  const handleUpdateDocumentsUrl = async () => {
    if (!story) return

    setIsUpdatingUrl(true)
    try {
      const res = await fetch(`/api/admin/stories/${story.id}/documents-url`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentsUrl: documentsUrlInput || null }),
      })

      if (res.ok) {
        // ストーリーを再取得
        await fetchStory(story.id)
        setShowDocumentsUrlModal(false)
        setDocumentsUrlInput("")
      } else {
        const data = await res.json()
        alert(data.error || "URLの更新に失敗しました")
      }
    } catch (error) {
      console.error("Error updating documents URL:", error)
      alert("URLの更新に失敗しました")
    } finally {
      setIsUpdatingUrl(false)
    }
  }

  const openDocumentsUrlModal = () => {
    setDocumentsUrlInput(story?.documentsUrl || "")
    setShowDocumentsUrlModal(true)
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

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">体験記が見つかりません</p>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all"
              style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              体験記一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 戻るボタン */}
        <Link
          href="/stories"
          className="inline-flex items-center text-sm font-semibold mb-6 px-4 py-2 rounded-lg transition-all"
          style={{ color: '#044465' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f4f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          体験記一覧に戻る
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* ヘッダー */}
          <div className="p-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight flex flex-wrap items-center gap-2">
                  <span>{story.university}</span>
                  <span>{story.faculty}</span>
                  <span className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                    {story.admissionType}
                  </span>
                  {story.year && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                      {story.year}年度
                    </span>
                  )}
                  {(() => {
                    const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult)
                    return result ? (
                      <span className={`inline-flex items-center px-3 py-1 ${result.color} text-white text-sm font-semibold rounded-full`}>
                        {result.label}
                      </span>
                    ) : null
                  })()}
                </h1>
              </div>
              {session?.user && (
                <div className="flex gap-2 flex-shrink-0">
                  {(session.user.role === "SUPER_ADMIN" ||
                    session.user.role === "ADMIN" ||
                    session.user.role === "STAFF" ||
                    (story.author && session.user.id === story.author.id)) && (
                    <button
                      onClick={() => {
                        // 管理者は管理画面、投稿者本人はユーザー編集ページへ
                        if (session.user.role === "SUPER_ADMIN" ||
                            session.user.role === "ADMIN" ||
                            session.user.role === "STAFF") {
                          router.push(`/admin/stories/${story.id}/edit`)
                        } else {
                          router.push(`/stories/${story.id}/edit`)
                        }
                      }}
                      className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-200 shadow-lg"
                      title="編集する"
                    >
                      <Edit className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={toggleFavorite}
                    disabled={isFavoriteLoading}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      isFavorited
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                    }`}
                    title={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    <Heart
                      className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* 投稿者情報 */}
            {(story.authorName || story.highSchoolName || story.campus || story.concurrentApplications.length > 0 ||
              ((session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && story.documentsUrl)) && (
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f0f4f5' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#044465' }}>
                  投稿者情報
                </h2>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {story.highSchoolName && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" style={{ color: '#044465' }} />
                        <span className="font-semibold" style={{ color: '#044465' }}>{story.highSchoolName}</span>
                      </div>
                    )}
                    {story.campus && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" style={{ color: '#044465' }} />
                        <span className="font-semibold" style={{ color: '#044465' }}>{story.campus}</span>
                      </div>
                    )}
                    {story.authorName && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" style={{ color: '#055a7a' }} />
                        <span className="font-semibold" style={{ color: '#044465' }}>{story.authorName}</span>
                      </div>
                    )}
                  </div>
                  {/* 管理者用: 合格書類URL */}
                  {(session?.user?.role === "SUPER_ADMIN" ||
                    session?.user?.role === "ADMIN" ||
                    session?.user?.role === "STAFF") && (
                    <div className="pt-3 border-t" style={{ borderColor: '#bac9d0' }}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: '#044465' }}>合格書類（管理者のみ）</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.documentsUrl ? (
                          <>
                            <a
                              href={story.documentsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                            >
                              <ExternalLink className="w-4 h-4" />
                              合格書類を閲覧する
                            </a>
                            <button
                              onClick={openDocumentsUrlModal}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                            >
                              <Edit className="w-4 h-4" />
                              URLを変更する
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={openDocumentsUrlModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            <ExternalLink className="w-4 h-4" />
                            合格書類を掲載する
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {/* 併願校 */}
                  {story.concurrentApplications.length > 0 && (
                    <div className="pt-3 border-t" style={{ borderColor: '#bac9d0' }}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: '#044465' }}>併願校</h3>
                      <div className="space-y-2">
                        {story.concurrentApplications.map((app, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-white">
                            <span className="text-sm text-gray-700 font-medium">
                              {app.university} {app.faculty}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                app.result === "ACCEPTED"
                                  ? "bg-green-500 text-white"
                                  : app.result === "REJECTED"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-400 text-white"
                              }`}
                            >
                              {labels.result[app.result as keyof typeof labels.result]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 基礎属性 */}
            <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#044465' }}>基礎属性</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {story.gender && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                    <p className="text-xs text-gray-600 mb-1">性別</p>
                    <p className="font-semibold" style={{ color: '#044465' }}>
                      {labels.gender[story.gender as keyof typeof labels.gender]}
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                  <p className="text-xs text-gray-600 mb-1">高校偏差値帯</p>
                  <p className="font-semibold" style={{ color: '#044465' }}>
                    {labels.highSchoolLevel[story.highSchoolLevel as keyof typeof labels.highSchoolLevel]}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                  <p className="text-xs text-gray-600 mb-1">評定平均</p>
                  <p className="font-semibold" style={{ color: '#044465' }}>
                    {labels.gradeAverage[story.gradeAverage as keyof typeof labels.gradeAverage]}
                  </p>
                </div>
              </div>
            </div>

            {/* 実績 */}
            {(story.hasSportsAchievement || story.hasEnglishQualification || story.hasStudyAbroad || story.hasLeaderExperience || story.hasContestAchievement) && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#044465' }}>
                  <Award className="w-6 h-6" />
                  実績
                </h2>
                <div className="space-y-4">
                  {story.hasSportsAchievement && story.sportsDetails && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#044465' }}>
                        <Award className="w-5 h-5" />
                        スポーツ実績
                      </h3>
                      <p className="text-gray-700 mb-2"><strong>競技：</strong>{story.sportsDetails}</p>
                      {story.sportsAchievements && story.sportsAchievements.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">実績：</p>
                          <div className="flex flex-wrap gap-2">
                            {story.sportsAchievements.map((achievement, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full"
                              >
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {story.hasEnglishQualification && story.englishQualification && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#044465' }}>
                        <Globe className="w-5 h-5" />
                        英語資格
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{story.englishQualification}</p>
                    </div>
                  )}
                  {story.hasStudyAbroad && story.studyAbroadDetails && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#044465' }}>
                        <Globe className="w-5 h-5" />
                        留学経験
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{story.studyAbroadDetails}</p>
                    </div>
                  )}
                  {story.hasLeaderExperience && story.leaderExperienceDetails && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#044465' }}>
                        <Users className="w-5 h-5" />
                        リーダー経験
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{story.leaderExperienceDetails}</p>
                    </div>
                  )}
                  {story.hasContestAchievement && story.contestAchievementDetails && (
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#044465' }}>
                        <Award className="w-5 h-5" />
                        コンテスト実績
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{story.contestAchievementDetails}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 探究テーマ */}
            {story.explorationThemes.length > 0 && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#044465' }}>
                  探究テーマ
                </h2>
                <div className="flex flex-wrap gap-2">
                  {story.explorationThemes.map((et) => (
                    <span
                      key={et.theme.id}
                      className="inline-block px-4 py-2 text-sm font-semibold rounded-full border"
                      style={{ color: '#044465', backgroundColor: '#f0f4f5', borderColor: '#bac9d0' }}
                    >
                      {et.theme.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 探究・活動 */}
            {(story.researchTheme || story.researchMotivation || story.researchDetails || story.targetProfessor) && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#044465' }}>
                  <Target className="w-6 h-6" />
                  探究・活動
                </h2>
                <div className="space-y-4">
                  {story.researchTheme && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>志</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.researchTheme}
                      </p>
                    </div>
                  )}
                  {story.researchMotivation && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>きっかけ</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.researchMotivation}
                      </p>
                    </div>
                  )}
                  {story.researchDetails && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>探究活動の詳細</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.researchDetails}
                      </p>
                    </div>
                  )}
                  {story.targetProfessor && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>大学で学びたい教授</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.targetProfessor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 選考情報 */}
            {story.interviewQuestions && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#044465' }}>
                  <FileText className="w-6 h-6" />
                  選考情報
                </h2>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>面接で聞かれた内容</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {story.interviewQuestions}
                  </p>
                </div>
              </div>
            )}

            {/* 対策 */}
            {(story.documentPreparation || story.secondRoundPreparation || story.materials) && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#044465' }}>
                  <BookOpen className="w-6 h-6" />
                  対策
                </h2>
                <div className="space-y-4">
                  {story.documentPreparation && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>書類対策</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.documentPreparation}
                      </p>
                    </div>
                  )}
                  {story.secondRoundPreparation && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>二次対策</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.secondRoundPreparation}
                      </p>
                    </div>
                  )}
                  {story.materials && (
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#055a7a' }}>使用教材・参考書</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {story.materials}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 後輩へのアドバイス */}
            {story.adviceToJuniors && (
              <div className="border-t pt-6" style={{ borderColor: '#bac9d0' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#044465' }}>後輩へのアドバイス</h2>
                <div className="p-6 rounded-xl border-2" style={{ borderColor: '#bac9d0', backgroundColor: '#f0f4f5' }}>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {story.adviceToJuniors}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 合格書類URLモーダル */}
        {showDocumentsUrlModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#044465' }}>
                {story?.documentsUrl ? '合格書類URLを変更' : '合格書類URLを掲載'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    合格書類のURL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                    value={documentsUrlInput}
                    onChange={(e) => setDocumentsUrlInput(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Google Drive、Dropbox等の共有リンクを入力してください
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDocumentsUrlModal(false)
                      setDocumentsUrlInput("")
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isUpdatingUrl}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdateDocumentsUrl}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isUpdatingUrl}
                  >
                    {isUpdatingUrl ? '更新中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
