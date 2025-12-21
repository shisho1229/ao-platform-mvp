"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Clock, ExternalLink, ArrowLeft } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  admissionType: string
  year?: number
  authorName?: string
  status: string
  reviewNotes?: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    campus?: string
  }
  explorationThemes: Array<{
    theme: {
      id: number
      name: string
    }
  }>
}

export default function AdminPendingStoriesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  const isStaffOrAdmin = session?.user?.role === "SUPER_ADMIN" ||
                         session?.user?.role === "ADMIN" ||
                         session?.user?.role === "STAFF"

  useEffect(() => {
    if (!isStaffOrAdmin) {
      router.push("/")
      return
    }

    fetchPendingStories()
  }, [session, router])

  const fetchPendingStories = async () => {
    try {
      const response = await fetch("/api/admin/stories/pending")
      if (response.ok) {
        const data = await response.json()
        setStories(data)
      }
    } catch (error) {
      console.error("承認待ち体験記取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (storyId: string) => {
    if (!confirm("この体験記を承認して公開しますか？")) return

    setProcessing(storyId)
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        alert("体験記を承認しました")
        fetchPendingStories()
      } else {
        const data = await response.json()
        alert(`承認に失敗しました: ${data.error}`)
      }
    } catch (error) {
      console.error("承認エラー:", error)
      alert("承認に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  const handleRequestRevision = async (storyId: string) => {
    if (!reviewNotes.trim()) {
      alert("修正依頼の内容を入力してください")
      return
    }

    setProcessing(storyId)
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_revision",
          reviewNotes: reviewNotes,
        }),
      })

      if (response.ok) {
        alert("修正を依頼しました")
        setShowReviewModal(null)
        setReviewNotes("")
        fetchPendingStories()
      } else {
        const data = await response.json()
        alert(`修正依頼に失敗しました: ${data.error}`)
      }
    } catch (error) {
      console.error("修正依頼エラー:", error)
      alert("修正依頼に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/admin/stories"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            体験記管理に戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">承認待ち体験記</h1>
              <p className="mt-2 text-sm text-gray-600">
                投稿された体験記を確認し、承認または修正を依頼してください
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{stories.length}件</span>
            </div>
          </div>
        </div>

        {/* 体験記リスト */}
        {stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">承認待ちの体験記はありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-orange-500"
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          {story.university} {story.faculty}
                        </h2>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                          承認待ち
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>{story.admissionType}</span>
                        {story.year && <span>• {story.year}年度</span>}
                        {story.authorName && <span>• {story.authorName}</span>}
                      </div>
                    </div>
                    <Link
                      href={`/stories/${story.id}`}
                      target="_blank"
                      className="flex-shrink-0 ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="体験記を見る"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* 投稿者情報 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">投稿者:</span>
                        <span className="ml-2 font-medium">{story.author.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">メール:</span>
                        <span className="ml-2 font-medium">{story.author.email}</span>
                      </div>
                      {story.author.campus && (
                        <div>
                          <span className="text-gray-600">校舎:</span>
                          <span className="ml-2 font-medium">{story.author.campus}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">投稿日:</span>
                        <span className="ml-2 font-medium">
                          {new Date(story.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 探究テーマ */}
                  {story.explorationThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 font-medium mb-2">探究テーマ:</p>
                      <div className="flex flex-wrap gap-2">
                        {story.explorationThemes.map((et) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full"
                          >
                            {et.theme.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(story.id)}
                      disabled={processing === story.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">承認して公開</span>
                    </button>
                    <button
                      onClick={() => setShowReviewModal(story.id)}
                      disabled={processing === story.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">修正を依頼</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 修正依頼モーダル */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">修正依頼</h3>
              <p className="text-sm text-gray-600 mb-4">
                投稿者に送信する修正依頼の内容を入力してください
              </p>
              <textarea
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                rows={6}
                placeholder="修正が必要な箇所や理由を具体的に記載してください"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(null)
                    setReviewNotes("")
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleRequestRevision(showReviewModal)}
                  disabled={!reviewNotes.trim() || processing === showReviewModal}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
