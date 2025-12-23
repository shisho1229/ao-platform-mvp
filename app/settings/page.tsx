"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Settings, AlertTriangle, Trash2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmModal"

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteSection, setShowDeleteSection] = useState(false)

  const handleDeleteAccount = async () => {
    if (!password) {
      showToast("パスワードを入力してください", "error")
      return
    }

    const confirmed = await confirm({
      title: "アカウントを削除",
      message: "本当にアカウントを削除しますか？この操作は取り消せません。投稿した体験記やお気に入りもすべて削除されます。",
      confirmText: "削除する",
      variant: "danger",
    })

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/users/me/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("アカウントを削除しました", "success")
        // サインアウトしてトップページへ
        await signOut({ redirect: false })
        router.push("/auth/signin")
      } else {
        showToast(data.error || "削除に失敗しました", "error")
      }
    } catch (error) {
      console.error("削除エラー:", error)
      showToast("削除に失敗しました", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
          <Settings className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#044465' }}>
          アカウント設定
        </h1>
        <p className="text-gray-600">
          アカウントの管理ができます
        </p>
      </div>

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border" style={{ borderColor: '#bac9d0' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#044465' }}>アカウント情報</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e7eb' }}>
            <span className="text-gray-600">名前</span>
            <span className="font-medium" style={{ color: '#044465' }}>{session.user?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e7eb' }}>
            <span className="text-gray-600">メールアドレス</span>
            <span className="font-medium" style={{ color: '#044465' }}>{session.user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">ロール</span>
            <span className="font-medium" style={{ color: '#044465' }}>
              {session.user?.role === "SUPER_ADMIN" ? "最高管理者" :
               session.user?.role === "STAFF" ? "スタッフ" : "ユーザー"}
            </span>
          </div>
        </div>
      </div>

      {/* 退会セクション */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-red-600">危険な操作</h2>
        </div>

        {!showDeleteSection ? (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              アカウントを削除すると、すべてのデータが完全に削除されます。
            </p>
            <button
              onClick={() => setShowDeleteSection(true)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              アカウント削除へ進む
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-700 text-sm font-medium mb-2">以下のデータが削除されます：</p>
              <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                <li>アカウント情報</li>
                <li>投稿した体験記</li>
                <li>お気に入り登録</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認のためパスワードを入力してください
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteSection(false)
                  setPassword("")
                }}
                className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !password}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "削除中..." : "アカウントを削除"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
