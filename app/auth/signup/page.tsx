"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [campus, setCampus] = useState("")
  const [role, setRole] = useState("USER")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // パスワード確認チェック
    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, campus, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "アカウント登録に失敗しました")
      } else {
        setSuccessMessage(data.message)
        setSuccess(true)
      }
    } catch (error) {
      setError("サーバーエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #044465 0%, #34495e 50%, #e8eef5 100%)' }}>
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#044465' }}>
              登録完了
            </h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {successMessage}
              </p>
            </div>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-2 rounded-md text-white"
              style={{ background: '#044465' }}
            >
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #044465 0%, #34495e 50%, #e8eef5 100%)' }}>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold" style={{ color: '#044465' }}>
            Loohcs志塾 合格者体験記
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            新規アカウント登録
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                placeholder="山田太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">
                所属校舎 *
              </label>
              <select
                id="campus"
                name="campus"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                disabled={isLoading}
              >
                <option value="">選択してください</option>
                <option value="武蔵小杉">武蔵小杉</option>
                <option value="下北沢">下北沢</option>
                <option value="自由が丘">自由が丘</option>
                <option value="渋谷">渋谷</option>
                <option value="オンライン">オンライン</option>
                <option value="青葉台">青葉台</option>
              </select>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                ロール *
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="USER">一般ユーザー（生徒・卒業生）</option>
                <option value="STAFF">スタッフ</option>
                <option value="SUPER_ADMIN">最高管理者</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#044465' }}
            >
              {isLoading ? "登録中..." : "登録"}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">既にアカウントをお持ちの方は</span>
            <Link href="/auth/signin" className="font-medium ml-1" style={{ color: '#044465' }}>
              ログイン
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
