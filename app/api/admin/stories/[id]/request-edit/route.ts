import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

// POST /api/admin/stories/[id]/request-edit - 編集依頼メール送信
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "編集依頼メッセージを入力してください" },
        { status: 400 }
      )
    }

    // 体験談と投稿者情報を取得
    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // ステータスを「修正依頼中」に更新
    await prisma.graduateStory.update({
      where: { id: storyId },
      data: { status: "NEEDS_REVISION" },
    })

    // メール送信
    try {
      await sendEmail({
        to: story.author.email,
        subject: "【Loohcs志塾】体験談の編集依頼",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(to right, #044465, #055a7a); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .message-box { background: white; padding: 20px; border-left: 4px solid #044465; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                .button { display: inline-block; background: #044465; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Loohcs志塾</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">体験談の編集依頼</p>
                </div>
                <div class="content">
                  <p>${story.author.name || '投稿者'} 様</p>
                  <p>いつもお世話になっております。<br>Loohcs志塾です。</p>
                  <p>投稿いただいた体験談について、編集のご依頼がございます。</p>

                  <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">対象の体験談</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #044465;">
                      ${story.university} ${story.faculty}
                    </p>
                  </div>

                  <div class="message-box">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #044465;">編集依頼内容</p>
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                  </div>

                  <p>お手数ですが、ご確認のうえ修正をお願いいたします。</p>

                  <a href="${process.env.NEXTAUTH_URL}/stories/${storyId}/edit" class="button">体験談を編集する</a>

                  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    何かご不明な点がございましたら、お気軽にお問い合わせください。
                  </p>
                </div>
                <div class="footer">
                  <p>このメールはLoohcs志塾のシステムから自動送信されています。</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      console.log("編集依頼メール送信成功:", {
        to: story.author.email,
        storyId,
        university: story.university,
        faculty: story.faculty,
      })
    } catch (emailError) {
      console.error("メール送信エラー:", emailError)
      // メール送信に失敗してもエラーにはしない（ログのみ）
      // 本番環境では、メール送信失敗を記録する仕組みを追加することを推奨
    }

    return NextResponse.json({
      message: "編集依頼を送信しました",
      recipient: {
        name: story.author.name,
        email: story.author.email,
      },
    })
  } catch (error: any) {
    console.error("Error sending edit request:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "編集依頼の送信に失敗しました" },
      { status: 500 }
    )
  }
}
