/**
 * セキュリティユーティリティ
 * XSS対策、入力検証などのセキュリティ関連機能
 */

/**
 * HTMLエスケープ - XSS対策
 * ユーザー入力をHTMLに埋め込む前に必ずエスケープする
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * メールアドレスのバリデーション
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * パスワード強度チェック
 * - 最低8文字
 * - 大文字・小文字・数字を含む
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "パスワードは8文字以上にしてください" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "パスワードには小文字を含めてください" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "パスワードには大文字を含めてください" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "パスワードには数字を含めてください" }
  }

  return { valid: true }
}

/**
 * 簡易レート制限チェック用のメモリストア
 * 本番環境ではRedis等を使用することを推奨
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * レート制限チェック
 * @param identifier - IPアドレスやユーザーIDなど
 * @param limit - 許可するリクエスト数
 * @param windowMs - 時間枠（ミリ秒）
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // 古いレコードをクリーンアップ
  if (record && record.resetTime < now) {
    rateLimitStore.delete(identifier)
  }

  const current = rateLimitStore.get(identifier)

  if (!current) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }

  current.count++
  return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime }
}

/**
 * SQLインジェクション対策のための入力サニタイズ
 * Prismaは自動的にサニタイズするが、追加の防御層として
 */
export function sanitizeInput(input: string): string {
  // NULL バイト除去
  let sanitized = input.replace(/\0/g, "")

  // 制御文字除去（改行・タブは許可）
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  return sanitized.trim()
}

/**
 * IPアドレスを取得（プロキシ対応）
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  return "unknown"
}
