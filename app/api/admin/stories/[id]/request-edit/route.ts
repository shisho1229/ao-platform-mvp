import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // TODO: メール送信機能を実装
    // 現時点では、コンソールにログを出力してメール送信の代わりとする
    console.log("編集依頼メール送信:")
    console.log("宛先:", story.author.email)
    console.log("投稿者名:", story.author.name)
    console.log("体験談ID:", storyId)
    console.log("大学:", story.university)
    console.log("学部:", story.faculty)
    console.log("メッセージ:", message)

    // メール送信のプレースホルダー
    // 将来的には Resend や SendGrid などのサービスを使用して実際にメールを送信
    /*
    await sendEmail({
      to: story.author.email,
      subject: "【Loohcs志塾】体験談の編集依頼",
      body: `
        ${story.author.name} 様

        いつもお世話になっております。
        Loohcs志塾です。

        投稿いただいた体験談（${story.university} ${story.faculty}）について、
        以下の編集をお願いしたくご連絡いたしました。

        【編集依頼内容】
        ${message}

        お手数ですが、ご確認のうえ修正をお願いいたします。

        何かご不明な点がございましたら、お気軽にお問い合わせください。

        よろしくお願いいたします。
      `,
    })
    */

    return NextResponse.json({
      message: "編集依頼を送信しました（現在はログ出力のみ）",
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
