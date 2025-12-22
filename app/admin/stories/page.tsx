"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Trash2, Link as LinkIcon, Mail, ExternalLink, Edit, ChevronDown, X, MapPin, Calendar, User } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmModal"

interface Story {
  id: string
  university: string
  faculty: string
  admissionType: string
  year?: number
  campus?: string
  firstRoundResult?: string
  secondRoundResult?: string
  status: string
  published: boolean
  documentsUrl?: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    campus?: string
  }
}

export default function AdminStoriesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending_review" | "needs_revision" | "published" | "unpublished">("pending_review")
  const [universityFilter, setUniversityFilter] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [campusFilter, setCampusFilter] = useState("")
  const [admissionResultFilter, setAdmissionResultFilter] = useState("")
  const [showDocumentsModal, setShowDocumentsModal] = useState<string | null>(null)
  const [showEditRequestModal, setShowEditRequestModal] = useState<string | null>(null)
  const [documentsUrl, setDocumentsUrl] = useState("")
  const [editRequestMessage, setEditRequestMessage] = useState("")
  const [selectedStories, setSelectedStories] = useState<string[]>([])
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const isStaffOrAdmin = session?.user?.role === "SUPER_ADMIN" ||
                         session?.user?.role === "ADMIN" ||
                         session?.user?.role === "STAFF"

  useEffect(() => {
    if (!isStaffOrAdmin) {
      router.push("/")
      return
    }

    fetchStories()
  }, [session, router, filter, universityFilter, facultyFilter, yearFilter, campusFilter, admissionResultFilter])

  const fetchStories = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === "pending_review") {
        params.append("status", "PENDING_REVIEW")
      } else if (filter === "needs_revision") {
        params.append("status", "NEEDS_REVISION")
      } else if (filter === "published") {
        params.append("published", "true")
      } else if (filter === "unpublished") {
        params.append("published", "false")
      }

      // 詳細フィルター
      if (universityFilter) params.append("university", universityFilter)
      if (facultyFilter) params.append("faculty", facultyFilter)
      if (yearFilter) params.append("year", yearFilter)
      if (campusFilter) params.append("campus", campusFilter)
      if (admissionResultFilter) params.append("admissionResult", admissionResultFilter)

      const response = await fetch(`/api/admin/stories?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStories(data)
      }
    } catch (error) {
      console.error("体験記取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setUniversityFilter("")
    setFacultyFilter("")
    setYearFilter("")
    setCampusFilter("")
    setAdmissionResultFilter("")
  }

  const handleTogglePublish = async (storyId: string, currentStatus: boolean) => {
    const confirmed = await confirm({
      title: currentStatus ? "非公開にする" : "公開する",
      message: `この体験記を${currentStatus ? "非公開" : "公開"}にしますか？`,
      confirmText: currentStatus ? "非公開にする" : "公開する",
      variant: currentStatus ? "warning" : "info",
    })
    if (!confirmed) return

    setProcessing(storyId)
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/toggle-publish`, {
        method: "POST",
      })

      if (response.ok) {
        showToast(`体験記を${currentStatus ? "非公開" : "公開"}にしました`, "success")
        fetchStories()
      } else {
        showToast("公開状態の切り替えに失敗しました", "error")
      }
    } catch (error) {
      console.error("公開切り替えエラー:", error)
      showToast("公開状態の切り替えに失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (storyId: string) => {
    const confirmed = await confirm({
      title: "体験記を削除",
      message: "この体験記を削除しますか？この操作は取り消せません。",
      confirmText: "削除",
      variant: "danger",
    })
    if (!confirmed) return

    setProcessing(storyId)
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showToast("体験記を削除しました", "success")
        fetchStories()
      } else {
        showToast("削除に失敗しました", "error")
      }
    } catch (error) {
      console.error("削除エラー:", error)
      showToast("削除に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleSaveDocumentsUrl = async () => {
    if (!showDocumentsModal) return

    setProcessing(showDocumentsModal)
    try {
      const response = await fetch(`/api/admin/stories/${showDocumentsModal}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentsUrl }),
      })

      if (response.ok) {
        showToast("書類URLを保存しました", "success")
        setShowDocumentsModal(null)
        setDocumentsUrl("")
        fetchStories()
      } else {
        const error = await response.json()
        showToast(error.error || "書類URLの保存に失敗しました", "error")
      }
    } catch (error) {
      console.error("書類URL保存エラー:", error)
      showToast("書類URLの保存に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleSendEditRequest = async () => {
    if (!showEditRequestModal) return

    if (!editRequestMessage.trim()) {
      showToast("編集依頼メッセージを入力してください", "warning")
      return
    }

    setProcessing(showEditRequestModal)
    try {
      const response = await fetch(`/api/admin/stories/${showEditRequestModal}/request-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editRequestMessage }),
      })

      if (response.ok) {
        showToast("編集依頼を送信しました", "success")
        setShowEditRequestModal(null)
        setEditRequestMessage("")
      } else {
        const error = await response.json()
        showToast(error.error || "編集依頼の送信に失敗しました", "error")
      }
    } catch (error) {
      console.error("編集依頼送信エラー:", error)
      showToast("編集依頼の送信に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const openDocumentsModal = (story: Story) => {
    setShowDocumentsModal(story.id)
    setDocumentsUrl(story.documentsUrl || "")
  }

  const openEditRequestModal = (storyId: string) => {
    setShowEditRequestModal(storyId)
    setEditRequestMessage("")
  }

  const toggleSelectAll = () => {
    if (selectedStories.length === stories.length) {
      setSelectedStories([])
    } else {
      setSelectedStories(stories.map(s => s.id))
    }
  }

  const toggleSelectStory = (storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    )
  }

  const handleBulkOperation = async (action: "publish" | "unpublish" | "approve" | "delete") => {
    if (selectedStories.length === 0) {
      showToast("体験記を選択してください", "warning")
      return
    }

    const actionLabel = action === "publish" ? "公開" : action === "unpublish" ? "非公開" : action === "approve" ? "承認" : "削除"
    const confirmed = await confirm({
      title: `一括${actionLabel}`,
      message: `選択した${selectedStories.length}件の体験記を${actionLabel}しますか？`,
      confirmText: actionLabel,
      variant: action === "delete" ? "danger" : "info",
    })
    if (!confirmed) return

    setBulkProcessing(true)
    try {
      const response = await fetch("/api/admin/stories/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, storyIds: selectedStories })
      })

      if (response.ok) {
        const data = await response.json()
        showToast(data.message, "success")
        setSelectedStories([])
        fetchStories()
      } else {
        const error = await response.json()
        showToast(error.error || "一括操作に失敗しました", "error")
      }
    } catch (error) {
      console.error("一括操作エラー:", error)
      showToast("一括操作に失敗しました", "error")
    } finally {
      setBulkProcessing(false)
    }
  }

  const getStatusBadge = (story: Story) => {
    const className = story.status === "PENDING_REVIEW"
      ? "bg-yellow-100 text-yellow-800"
      : story.status === "NEEDS_REVISION"
      ? "bg-orange-100 text-orange-800"
      : story.published
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"

    const label = story.status === "PENDING_REVIEW"
      ? "添削待ち"
      : story.status === "NEEDS_REVISION"
      ? "修正依頼中"
      : story.published
      ? "公開中"
      : "非公開"

    return { className, label }
  }

  const getResultBadge = (story: Story) => {
    if (story.secondRoundResult && ["合格", "AB合格", "A合格", "B合格"].includes(story.secondRoundResult)) {
      return { label: "合格", color: "bg-green-500 text-white" }
    }
    if (story.firstRoundResult && ["合格", "AB合格", "A合格", "B合格"].includes(story.firstRoundResult)) {
      return { label: "一次合格", color: "bg-blue-500 text-white" }
    }
    if (story.secondRoundResult && ["不合格"].includes(story.secondRoundResult)) {
      return { label: "不合格", color: "bg-gray-500 text-white" }
    }
    return { label: "未記入", color: "bg-gray-200 text-gray-600" }
  }

  // モバイル用カードコンポーネント
  const StoryCard = ({ story }: { story: Story }) => {
    const status = getStatusBadge(story)
    const result = getResultBadge(story)

    return (
      <div className="bg-white rounded-lg shadow p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedStories.includes(story.id)}
              onChange={() => toggleSelectStory(story.id)}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900">{story.university}</h3>
              <p className="text-sm text-gray-600">{story.faculty}</p>
              <p className="text-xs text-gray-500">{story.admissionType}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
          {story.year && (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {story.year}年
            </div>
          )}
          {story.campus && (
            <div className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {story.campus}
            </div>
          )}
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${result.color}`}>
            {result.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 pb-3 border-b">
          <User className="w-3.5 h-3.5" />
          <span className="truncate">{story.author.name}</span>
          <span className="text-gray-400 truncate">({story.author.email})</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/admin/stories/${story.id}/edit`)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
          >
            <Edit className="w-3 h-3" />
            編集
          </button>

          <button
            onClick={() => handleTogglePublish(story.id, story.published)}
            disabled={processing === story.id}
            className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded text-white text-xs disabled:opacity-50 ${
              story.published ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {story.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {story.published ? "非公開" : "公開"}
          </button>

          <a
            href={`/stories/${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
          >
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => handleDelete(story.id)}
            disabled={processing === story.id}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  if (!isStaffOrAdmin) {
    return null
  }

  const filteredStories = stories
  const hasActiveFilters = universityFilter || facultyFilter || yearFilter || campusFilter || admissionResultFilter

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        {/* Filter Buttons - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setFilter("pending_review")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
              filter === "pending_review"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            添削待ち
          </button>
          <button
            onClick={() => setFilter("needs_revision")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
              filter === "needs_revision"
                ? "bg-orange-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            修正依頼中
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
              filter === "published"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            公開中
          </button>
          <button
            onClick={() => setFilter("unpublished")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
              filter === "unpublished"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            非公開
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            すべて
          </button>
        </div>

        {/* 詳細フィルター - Collapsible on mobile */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow text-sm font-medium text-gray-700"
          >
            <span>詳細フィルター {hasActiveFilters && `(${[universityFilter, facultyFilter, yearFilter, campusFilter, admissionResultFilter].filter(Boolean).length})`}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-2 sm:mt-0 bg-white rounded-lg shadow p-4`}>
            <h3 className="hidden sm:block text-sm font-semibold text-gray-700 mb-3">詳細フィルター</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">大学</label>
                <input
                  type="text"
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                  placeholder="例: 慶應義塾大学"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">学部</label>
                <input
                  type="text"
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  placeholder="例: 総合政策学部"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">年度</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">すべて</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">所属校舎</label>
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">すべて</option>
                  <option value="武蔵小杉">武蔵小杉</option>
                  <option value="下北沢">下北沢</option>
                  <option value="自由が丘">自由が丘</option>
                  <option value="渋谷">渋谷</option>
                  <option value="オンライン">オンライン</option>
                  <option value="青葉台">青葉台</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">合否情報</label>
                <select
                  value={admissionResultFilter}
                  onChange={(e) => setAdmissionResultFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">すべて</option>
                  <option value="first_pass">書類合格（一次のみ）</option>
                  <option value="final_pass">最終合格</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  フィルターをクリア
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 一括操作ボタン */}
      {selectedStories.length > 0 && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-semibold text-blue-900 text-sm sm:text-base">
              {selectedStories.length}件選択中
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkOperation("approve")}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50"
              >
                一括承認
              </button>
              <button
                onClick={() => handleBulkOperation("publish")}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                一括公開
              </button>
              <button
                onClick={() => handleBulkOperation("unpublish")}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-yellow-600 text-white rounded text-xs sm:text-sm hover:bg-yellow-700 disabled:opacity-50"
              >
                一括非公開
              </button>
              <button
                onClick={() => handleBulkOperation("delete")}
                disabled={bulkProcessing}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 disabled:opacity-50"
              >
                一括削除
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          体験記がありません
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <div className="sm:hidden">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedStories.length === stories.length && stories.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">すべて選択</span>
            </div>
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStories.length === stories.length && stories.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    大学・学部
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    入試方式
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校舎
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    結果
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    投稿者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStories.map((story) => {
                  const status = getStatusBadge(story)
                  const result = getResultBadge(story)
                  return (
                    <tr key={story.id}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStories.includes(story.id)}
                          onChange={() => toggleSelectStory(story.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{story.university}</div>
                        <div className="text-sm text-gray-500">{story.faculty}</div>
                        {story.year && <div className="text-xs text-gray-400">{story.year}年</div>}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{story.admissionType}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {story.campus || <span className="text-gray-400">未記入</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.color}`}>
                          {result.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{story.author.name}</div>
                        <div className="text-sm text-gray-500">{story.author.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => router.push(`/admin/stories/${story.id}/edit`)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                            title="編集"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(story.id, story.published)}
                            disabled={processing === story.id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white text-xs disabled:opacity-50 ${
                              story.published ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
                            }`}
                            title={story.published ? "非公開" : "公開"}
                          >
                            {story.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => openDocumentsModal(story)}
                            disabled={processing === story.id}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            title="書類URL"
                          >
                            <LinkIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditRequestModal(story.id)}
                            disabled={processing === story.id}
                            className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                            title="編集依頼"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                          <a
                            href={`/stories/${story.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            title="詳細"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleDelete(story.id)}
                            disabled={processing === story.id}
                            className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Documents URL Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">合格書類URL</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google DriveのURL
              </label>
              <input
                type="url"
                value={documentsUrl}
                onChange={(e) => setDocumentsUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                このURLは管理者とスタッフのみが閲覧できます
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDocumentsModal(null)
                  setDocumentsUrl("")
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveDocumentsUrl}
                disabled={processing === showDocumentsModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {showEditRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">編集依頼</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                依頼内容
              </label>
              <textarea
                value={editRequestMessage}
                onChange={(e) => setEditRequestMessage(e.target.value)}
                placeholder="投稿者に伝えたい編集内容を入力してください"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                投稿者のメールアドレスに送信されます
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditRequestModal(null)
                  setEditRequestMessage("")
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendEditRequest}
                disabled={processing === showEditRequestModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
