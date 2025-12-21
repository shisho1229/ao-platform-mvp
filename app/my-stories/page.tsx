"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Heart, Plus, Edit, Eye } from "lucide-react"

interface Story {
  id: string
  university: string
  faculty: string
  admissionType: string
  year?: number
  status: string
  published: boolean
  firstRoundResult?: string
  secondRoundResult?: string
  createdAt: string
  updatedAt: string
}

// 公開状態のラベル（シンプルに）

export default function MyStoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchMyStories()
    }
  }, [status, router])

  const fetchMyStories = async () => {
    try {
      const res = await fetch("/api/stories/my")
      if (res.ok) {
        const data = await res.json()
        setStories(data)
      } else if (res.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching my stories:", error)
    } finally {
      setIsLoading(false)
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #bac9d0, white, #bac9d0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#044465' }}>
              マイ投稿
            </h1>
            <p className="text-gray-600">
              あなたが投稿した体験記の一覧です
            </p>
          </div>
          <Link
            href="/stories/new"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
            style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
          >
            <Plus className="w-5 h-5" />
            新規投稿
          </Link>
        </div>

        {/* 投稿一覧 */}
        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-6">まだ投稿がありません</p>
            <Link
              href="/stories/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
              style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
            >
              <Plus className="w-5 h-5" />
              体験記を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => {
              const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult)

              return (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* ステータスバッジ */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {story.status === "PENDING_REVIEW" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-yellow-500">
                          添削待ち
                        </span>
                      )}
                      {story.status === "NEEDS_REVISION" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-orange-500">
                          修正のお願い
                        </span>
                      )}
                      {story.published && story.status === "PUBLISHED" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-green-500">
                          公開中
                        </span>
                      )}
                      {result && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${result.color}`}>
                          {result.label}
                        </span>
                      )}
                    </div>

                    {/* 大学・学部 */}
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#044465' }}>
                      {story.university}
                    </h3>
                    <p className="text-gray-700 font-medium mb-2">{story.faculty}</p>

                    {/* 入試方式・年度 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        {story.admissionType}
                      </span>
                      {story.year && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {story.year}年度
                        </span>
                      )}
                    </div>

                    {/* 投稿日・更新日 */}
                    <div className="text-xs text-gray-500 mb-4">
                      <p>投稿日: {new Date(story.createdAt).toLocaleDateString('ja-JP')}</p>
                      <p>更新日: {new Date(story.updatedAt).toLocaleDateString('ja-JP')}</p>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <Link
                        href={`/stories/${story.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        閲覧
                      </Link>
                      <Link
                        href={`/stories/${story.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-semibold"
                        style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
                      >
                        <Edit className="w-4 h-4" />
                        編集
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
