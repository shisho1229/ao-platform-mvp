"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"

interface PendingUser {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchPendingUsers()
  }, [session, router])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/users/pending")
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data)
      }
    } catch (error) {
      console.error("承認待ちユーザー取得エラー:", error)
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
        fetchPendingUsers()
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
        fetchPendingUsers()
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

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #34495e 50%, #e8eef5 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#1e3a5f' }}>
            ユーザー承認管理
          </h1>

          {loading ? (
            <div className="text-center py-12">読み込み中...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              承認待ちのユーザーはいません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ background: '#f0f4f8' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
                      登録日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
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
                        <div className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1 rounded-md text-white disabled:opacity-50"
                            style={{ background: '#22c55e' }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={processing === user.id}
                            className="inline-flex items-center px-3 py-1 rounded-md text-white disabled:opacity-50"
                            style={{ background: '#ef4444' }}
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
          )}
        </div>
      </div>
    </div>
  )
}
