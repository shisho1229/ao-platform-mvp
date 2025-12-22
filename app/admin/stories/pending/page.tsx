"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Clock, ExternalLink, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmModal"

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
  const { showToast } = useToast()
  const { confirm } = useConfirm()
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
    const confirmed = await confirm({
      title: "体験記を承認",
      message: "この体験記を承認して公開しますか？",
      confirmText: "承認",
      variant: "info",
    })
    if (!confirmed) return

    setProcessing(storyId)
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        showToast("体験記を承認しました", "success")
        fetchPendingStories()
      } else {
        const data = await response.json()
        showToast(`承認に失敗しました: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("承認エラー:", error)
      showToast("承認に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleRequestRevision = async (storyId: string) => {
    if (!reviewNotes.trim()) {
      showToast("修正依頼の内容を入力してください", "warning")
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
        showToast("修正を依頼しました", "success")
        setShowReviewModal(null)
        setReviewNotes("")
        fetchPendingStories()
      } else {
        const data = await response.json()
        showToast(`修正依頼に失敗しました: ${data.error}`, "error")
      }
    } catch (error) {
      console.error("修正依頼エラー:", error)
      showToast("修正依頼に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border" style={{ borderColor: '#bac9d0' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#044465' }}></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/admin/stories"
            className="inline-flex items-center text-sm hover:opacity-80 mb-4"
            style={{ color: '#044465' }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            体験記管理に戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#044465' }}>承認待ち体験記</h1>
              <p className="mt-2 text-sm text-gray-600">
                投稿された体験記を確認し、承認または修正を依頼してください
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-xl">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{stories.length}件</span>
            </div>
          </div>
        </div>

        {/* 体験記リスト */}
        {stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border" style={{ borderColor: '#bac9d0' }}>
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">承認待ちの体験記はありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border"
                style={{ borderColor: '#bac9d0', borderLeftWidth: '4px', borderLeftColor: '#f97316' }}
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold" style={{ color: '#044465' }}>
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
                      className="flex-shrink-0 ml-4 p-2 rounded-xl transition-colors"
                      style={{ color: '#044465' }}
                      title="体験記を見る"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* 投稿者情報 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">投稿者:</span>
                        <span className="ml-2 font-medium" style={{ color: '#044465' }}>{story.author.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">メール:</span>
                        <span className="ml-2 font-medium" style={{ color: '#044465' }}>{story.author.email}</span>
                      </div>
                      {story.author.campus && (
                        <div>
                          <span className="text-gray-600">校舎:</span>
                          <span className="ml-2 font-medium" style={{ color: '#044465' }}>{story.author.campus}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">投稿日:</span>
                        <span className="ml-2 font-medium" style={{ color: '#044465' }}>
                          {new Date(story.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 探究テーマ */}
                  {story.explorationThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2" style={{ color: '#044465' }}>探究テーマ:</p>
                      <div className="flex flex-wrap gap-2">
                        {story.explorationThemes.map((et) => (
                          <span
                            key={et.theme.id}
                            className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                            style={{ color: '#044465', backgroundColor: 'rgba(4, 68, 101, 0.1)' }}
                          >
                            {et.theme.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#bac9d0' }}>
                    <button
                      onClick={() => handleApprove(story.id)}
                      disabled={processing === story.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">承認して公開</span>
                    </button>
                    <button
                      onClick={() => setShowReviewModal(story.id)}
                      disabled={processing === story.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border" style={{ borderColor: '#bac9d0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#044465' }}>修正依頼</h3>
              <p className="text-sm text-gray-600 mb-4">
                投稿者に送信する修正依頼の内容を入力してください
              </p>
              <textarea
                className="w-full rounded-xl border shadow-sm focus:ring-2 mb-4"
                style={{ borderColor: '#bac9d0' }}
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
                  className="flex-1 px-4 py-2 border text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#bac9d0' }}
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleRequestRevision(showReviewModal)}
                  disabled={!reviewNotes.trim() || processing === showReviewModal}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
