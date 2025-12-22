import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

interface SendEmailWithLoggingOptions extends SendEmailOptions {
  type: string // edit_request, notification, etc.
  context?: Record<string, unknown> // 追加コンテキスト情報
}

// Resendクライアントを遅延初期化（ビルド時エラーを回避）
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }
  return new Resend(apiKey)
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    // Resendクライアントを初期化
    const resend = getResendClient()

    // 送信元メールアドレスを環境変数から取得（デフォルトは onboarding@resend.dev）
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev"

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email sending error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error in sendEmail:", error)
    throw error
  }
}

// メール送信（失敗時にログ記録付き）
export async function sendEmailWithLogging({
  to,
  subject,
  html,
  type,
  context,
}: SendEmailWithLoggingOptions): Promise<{ success: boolean; logged?: boolean }> {
  try {
    await sendEmail({ to, subject, html })
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // 失敗をデータベースに記録
    try {
      await prisma.failedEmail.create({
        data: {
          to,
          subject,
          type,
          error: errorMessage,
          context: context ? JSON.stringify(context) : null,
        },
      })
      console.log("Email failure logged to database:", { to, subject, type })
      return { success: false, logged: true }
    } catch (dbError) {
      console.error("Failed to log email failure to database:", dbError)
      return { success: false, logged: false }
    }
  }
}

// 未解決のメール送信失敗を取得
export async function getUnresolvedFailedEmails() {
  return prisma.failedEmail.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
  })
}

// メール送信失敗を解決済みにする
export async function resolveFailedEmail(id: string) {
  return prisma.failedEmail.update({
    where: { id },
    data: {
      resolved: true,
      resolvedAt: new Date(),
    },
  })
}
