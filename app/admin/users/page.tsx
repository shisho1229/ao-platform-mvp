"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, UserPlus, Shield, UserMinus, Mail, MapPin, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmModal"

interface User {
  id: string
  email: string
  name: string
  campus?: string
  role: string
  approved: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [staffUsers, setStaffUsers] = useState<User[]>([])
  const [regularUsers, setRegularUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "staff" | "users">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [campusFilter, setCampusFilter] = useState("")

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const isStaffOrAdmin = session?.user?.role === "SUPER_ADMIN" ||
                         session?.user?.role === "ADMIN" ||
                         session?.user?.role === "STAFF"

  useEffect(() => {
    if (!isStaffOrAdmin) {
      router.push("/")
      return
    }

    fetchUsers()
  }, [session, router, searchQuery, campusFilter])

  const fetchUsers = async () => {
    try {
      // クエリパラメータを構築
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (campusFilter) params.append("campus", campusFilter)
      const queryString = params.toString()

      // 承認待ちユーザー取得
      const pendingUrl = queryString ? `/api/users/pending?${queryString}` : "/api/users/pending"
      const pendingResponse = await fetch(pendingUrl)
      if (pendingResponse.ok) {
        const data = await pendingResponse.json()
        setPendingUsers(data)
      }

      // 承認済みユーザー取得
      const approvedUrl = queryString ? `/api/admin/users?approved=true&${queryString}` : "/api/admin/users?approved=true"
      const approvedResponse = await fetch(approvedUrl)
      if (approvedResponse.ok) {
        const data = await approvedResponse.json()

        // スタッフと一般ユーザーに分離
        const staff = data.filter((u: User) =>
          u.role === "SUPER_ADMIN" || u.role === "ADMIN" || u.role === "STAFF"
        )
        const users = data.filter((u: User) => u.role === "USER")

        setStaffUsers(staff)
        setRegularUsers(users)
      }
    } catch (error) {
      console.error("ユーザー取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCampusFilter("")
  }

  const handleApprove = async (userId: string) => {
    const confirmed = await confirm({
      title: "ユーザー承認",
      message: "このユーザーを承認しますか？",
      confirmText: "承認",
      variant: "info",
    })
    if (!confirmed) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        showToast("ユーザーを承認しました", "success")
        fetchUsers()
      } else {
        showToast("承認に失敗しました", "error")
      }
    } catch (error) {
      console.error("承認エラー:", error)
      showToast("承認に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    const confirmed = await confirm({
      title: "ユーザー拒否",
      message: "このユーザーを拒否（削除）しますか？この操作は取り消せません。",
      confirmText: "拒否",
      variant: "danger",
    })
    if (!confirmed) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/users/${userId}/reject`, {
        method: "DELETE",
      })

      if (response.ok) {
        showToast("ユーザーを拒否しました", "success")
        fetchUsers()
      } else {
        showToast("拒否に失敗しました", "error")
      }
    } catch (error) {
      console.error("拒否エラー:", error)
      showToast("拒否に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handlePromoteToStaff = async (userId: string) => {
    const confirmed = await confirm({
      title: "スタッフに昇格",
      message: "このユーザーにスタッフ権限を付与しますか？",
      confirmText: "昇格",
      variant: "info",
    })
    if (!confirmed) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote-staff`, {
        method: "POST",
      })

      if (response.ok) {
        showToast("スタッフ権限を付与しました", "success")
        fetchUsers()
      } else {
        const error = await response.json()
        showToast(error.error || "権限付与に失敗しました", "error")
      }
    } catch (error) {
      console.error("権限付与エラー:", error)
      showToast("権限付与に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const handleDemoteToUser = async (userId: string) => {
    const confirmed = await confirm({
      title: "ユーザーに降格",
      message: "このユーザーをスタッフからユーザーに降格しますか？",
      confirmText: "降格",
      variant: "warning",
    })
    if (!confirmed) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/demote-user`, {
        method: "POST",
      })

      if (response.ok) {
        showToast("ユーザー権限に降格しました", "success")
        fetchUsers()
      } else {
        const error = await response.json()
        showToast(error.error || "降格に失敗しました", "error")
      }
    } catch (error) {
      console.error("降格エラー:", error)
      showToast("降格に失敗しました", "error")
    } finally {
      setProcessing(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "最高管理者"
      case "ADMIN":
        return "管理者"
      case "STAFF":
        return "スタッフ"
      case "USER":
        return "ユーザー"
      default:
        return role
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800"
      case "ADMIN":
        return "bg-blue-100 text-blue-800"
      case "STAFF":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // モバイル用カードコンポーネント
  const UserCard = ({ user, actions }: { user: User, actions?: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-3 border" style={{ borderColor: '#bac9d0' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold truncate" style={{ color: '#044465' }}>{user.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Mail className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getRoleBadgeClass(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
        {user.campus && (
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {user.campus}
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {new Date(user.createdAt).toLocaleDateString('ja-JP')}
        </div>
      </div>
      {actions && (
        <div className="pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: '#bac9d0' }}>
          {actions}
        </div>
      )}
    </div>
  )

  if (!isStaffOrAdmin) {
    return null
  }

  return (
    <div>
      {/* 検索とフィルター */}
      <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-lg p-4 sm:p-6 border" style={{ borderColor: '#bac9d0' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#044465' }}>検索・フィルター</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 検索 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              名前またはメールアドレス
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 校舎フィルター */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              所属校舎
            </label>
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
        </div>

        {/* フィルタークリアボタン */}
        {(searchQuery || campusFilter) && (
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

      {/* Tab Navigation */}
      <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-lg p-2 border" style={{ borderColor: '#bac9d0' }}>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium rounded-xl transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "pending"
                ? "text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={activeTab === "pending" ? { background: 'linear-gradient(to right, #044465, #055a7a)' } : {}}
          >
            承認待ち ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 font-medium rounded-xl transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "staff"
                ? "text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={activeTab === "staff" ? { background: 'linear-gradient(to right, #044465, #055a7a)' } : {}}
          >
            スタッフ ({staffUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium rounded-xl transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "users"
                ? "text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={activeTab === "users" ? { background: 'linear-gradient(to right, #044465, #055a7a)' } : {}}
          >
            ユーザー ({regularUsers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border" style={{ borderColor: '#bac9d0' }}>
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : activeTab === "pending" ? (
        /* 承認待ちユーザー */
        pendingUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border" style={{ borderColor: '#bac9d0' }}>
            <p className="text-gray-500">承認待ちのユーザーはいません</p>
          </div>
        ) : (
          <>
            {/* モバイル: カード表示 */}
            <div className="sm:hidden">
              {pendingUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  actions={
                    <>
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={processing === user.id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        承認
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={processing === user.id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        拒否
                      </button>
                    </>
                  }
                />
              ))}
            </div>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: '#bac9d0' }}>
              <table className="min-w-full divide-y" style={{ borderColor: '#bac9d0' }}>
                <thead style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      校舎
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      登録日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#044465' }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.campus || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            拒否
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : activeTab === "staff" ? (
        /* スタッフユーザー */
        staffUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border" style={{ borderColor: '#bac9d0' }}>
            <p className="text-gray-500">スタッフユーザーはいません</p>
          </div>
        ) : (
          <>
            {/* モバイル: カード表示 */}
            <div className="sm:hidden">
              {staffUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  actions={
                    isSuperAdmin && user.role === "STAFF" ? (
                      <button
                        onClick={() => handleDemoteToUser(user.id)}
                        disabled={processing === user.id}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        ユーザーに降格
                      </button>
                    ) : undefined
                  }
                />
              ))}
            </div>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: '#bac9d0' }}>
              <table className="min-w-full divide-y" style={{ borderColor: '#bac9d0' }}>
                <thead style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      校舎
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      権限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      登録日時
                    </th>
                    {isSuperAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {staffUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#044465' }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.campus || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role === "STAFF" && (
                            <button
                              onClick={() => handleDemoteToUser(user.id)}
                              disabled={processing === user.id}
                              className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              ユーザーに降格
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        /* 一般ユーザー */
        regularUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border" style={{ borderColor: '#bac9d0' }}>
            <p className="text-gray-500">ユーザーはいません</p>
          </div>
        ) : (
          <>
            {/* モバイル: カード表示 */}
            <div className="sm:hidden">
              {regularUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  actions={
                    isSuperAdmin ? (
                      <button
                        onClick={() => handlePromoteToStaff(user.id)}
                        disabled={processing === user.id}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        スタッフに昇格
                      </button>
                    ) : undefined
                  }
                />
              ))}
            </div>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: '#bac9d0' }}>
              <table className="min-w-full divide-y" style={{ borderColor: '#bac9d0' }}>
                <thead style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      校舎
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      権限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      登録日時
                    </th>
                    {isSuperAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {regularUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#044465' }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.campus || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handlePromoteToStaff(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1.5 text-white rounded-lg disabled:opacity-50 transition-colors"
                            style={{ background: 'linear-gradient(to right, #044465, #055a7a)' }}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            スタッフに昇格
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  )
}
