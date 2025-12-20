"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, UserPlus, Shield, UserMinus } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "staff" | "users">("pending")

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
  }, [session, router])

  const fetchUsers = async () => {
    try {
      // 承認待ちユーザー取得
      const pendingResponse = await fetch("/api/users/pending")
      if (pendingResponse.ok) {
        const data = await pendingResponse.json()
        setPendingUsers(data)
      }

      // 承認済みユーザー取得
      const approvedResponse = await fetch("/api/admin/users?approved=true")
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

  if (!isStaffOrAdmin) {
    return null
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#044465' }}>
        ユーザー管理
      </h1>

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
      ) : (
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
                  {isSuperAdmin && (
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
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handlePromoteToStaff(user.id)}
                          disabled={processing === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
        )
      )}
    </div>
  )
}
