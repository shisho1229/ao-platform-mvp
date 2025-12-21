import { Resend } from "resend"

// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
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
