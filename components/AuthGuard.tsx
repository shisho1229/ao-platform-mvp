"use client"

import { useSession } from "next-auth/react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  // セッションの読み込み中は何も表示しない（ミドルウェアがリダイレクトを処理）
  if (status === "loading") {
    return null
  }

  return <>{children}</>
}
