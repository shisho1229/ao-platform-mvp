"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, UserPlus, Shield, UserMinus, GraduationCap } from "lucide-react"

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
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [staffUsers, setStaffUsers] = useState<User[]>([])
  const [regularUsers, setRegularUsers] = useState<User[]>([])
  const [graduateUsers, setGraduateUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "staff" | "users" | "graduates">("pending")
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

        // スタッフ、一般ユーザー、卒塾生に分離
        const staff = data.filter((u: User) =>
          u.role === "SUPER_ADMIN" || u.role === "ADMIN" || u.role === "STAFF"
        )
        const users = data.filter((u: User) => u.role === "USER")
        const graduates = data.filter((u: User) => u.role === "GRADUATE")

        setStaffUsers(staff)
        setRegularUsers(users)
        setGraduateUsers(graduates)
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
    if (!confirm("このユーザーを承認しますか？")) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        alert("ユーザーを承認しました")
        fetchUsers()
      } else {
        alert("承認に失敗しました")
      }
    } catch (error) {
      console.error("承認エラー:", error)
      alert("承認に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!confirm("このユーザーを拒否（削除）しますか？この操作は取り消せません。")) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/users/${userId}/reject`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("ユーザーを拒否しました")
        fetchUsers()
      } else {
        alert("拒否に失敗しました")
      }
    } catch (error) {
      console.error("拒否エラー:", error)
      alert("拒否に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  const handlePromoteToStaff = async (userId: string) => {
    if (!confirm("このユーザーにスタッフ権限を付与しますか？")) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote-staff`, {
        method: "POST",
      })

      if (response.ok) {
        alert("スタッフ権限を付与しました")
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error || "権限付与に失敗しました")
      }
    } catch (error) {
      console.error("権限付与エラー:", error)
      alert("権限付与に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  const handleDemoteToUser = async (userId: string) => {
    if (!confirm("このユーザーをスタッフからユーザーに降格しますか？")) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/demote-user`, {
        method: "POST",
      })

      if (response.ok) {
        alert("ユーザー権限に降格しました")
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error || "降格に失敗しました")
      }
    } catch (error) {
      console.error("降格エラー:", error)
      alert("降格に失敗しました")
    } finally {
      setProcessing(null)
    }
  }

  const handleChangeToGraduate = async (userId: string, toGraduate: boolean) => {
    if (!confirm(toGraduate ? "このユーザーを卒塾生に変更しますか？" : "このユーザーを一般ユーザーに戻しますか？")) return

    setProcessing(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-graduate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toGraduate })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error || "変更に失敗しました")
      }
    } catch (error) {
      console.error("卒塾生変更エラー:", error)
      alert("変更に失敗しました")
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
      case "GRADUATE":
        return "卒塾生"
      default:
        return role
    }
  }

  if (!isStaffOrAdmin) {
    return null
  }

  return (
    <div>
      {/* 検索とフィルター */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">検索・フィルター</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="mb-6 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            承認待ち ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "staff"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            スタッフ ({staffUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ユーザー ({regularUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("graduates")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "graduates"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            卒塾生 ({graduateUsers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : activeTab === "pending" ? (
        /* 承認待ちユーザー */
        pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            承認待ちのユーザーはいません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校舎
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.campus || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={processing === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          承認
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={processing === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
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
        )
      ) : activeTab === "staff" ? (
        /* スタッフユーザー */
        staffUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            スタッフユーザーはいません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校舎
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日時
                  </th>
                  {isSuperAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.campus || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800" :
                        user.role === "ADMIN" ? "bg-blue-100 text-blue-800" :
                        user.role === "STAFF" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === "STAFF" && (
                          <button
                            onClick={() => handleDemoteToUser(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
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
        )
      ) : activeTab === "users" ? (
        /* 一般ユーザー */
        regularUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            ユーザーはいません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校舎
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日時
                  </th>
                  {isStaffOrAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regularUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.campus || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </td>
                    {isStaffOrAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {isSuperAdmin && (
                            <button
                              onClick={() => handlePromoteToStaff(user.id)}
                              disabled={processing === user.id}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              スタッフに昇格
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeToGraduate(user.id, true)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            <GraduationCap className="w-4 h-4 mr-1" />
                            卒塾生に変更
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === "graduates" ? (
        /* 卒塾生 */
        graduateUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            卒塾生はいません
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校舎
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日時
                  </th>
                  {isStaffOrAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {graduateUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.campus || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </td>
                    {isStaffOrAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleChangeToGraduate(user.id, false)}
                          disabled={processing === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          ユーザーに戻す
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  )
}
