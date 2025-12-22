import { NextResponse } from "next/server"

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ErrorWithCode extends Error {
  code?: string
  meta?: unknown
}

export function handleApiError(error: unknown, defaultMessage: string = "エラーが発生しました") {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  const err = error as ErrorWithCode

  // 認証エラー
  if (err.message === "認証が必要です" || err.message === "Unauthorized") {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    )
  }

  // 権限エラー
  if (err.message === "権限がありません" || err.message === "Forbidden") {
    return NextResponse.json(
      { error: "権限がありません" },
      { status: 403 }
    )
  }

  // Prisma エラー
  if (err.code) {
    switch (err.code) {
      case "P2002":
        return NextResponse.json(
          { error: "既に存在するデータです", code: err.code },
          { status: 409 }
        )
      case "P2025":
        return NextResponse.json(
          { error: "データが見つかりません", code: err.code },
          { status: 404 }
        )
      default:
        break
    }
  }

  // 一般的なエラー
  const errorMessage = process.env.NODE_ENV === "development"
    ? err.message || defaultMessage
    : defaultMessage

  return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
  )
}

// よく使うエラーレスポンス
export const errorResponses = {
  unauthorized: () => NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: "権限がありません" }, { status: 403 }),
  notFound: (message = "見つかりません") => NextResponse.json({ error: message }, { status: 404 }),
  badRequest: (message = "不正なリクエストです") => NextResponse.json({ error: message }, { status: 400 }),
  conflict: (message = "既に存在します") => NextResponse.json({ error: message }, { status: 409 }),
  serverError: (message = "サーバーエラーが発生しました") => NextResponse.json({ error: message }, { status: 500 }),
}
