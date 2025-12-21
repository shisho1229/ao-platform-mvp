import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/stories/[id]/documents-url - 合格書類URLを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者権限チェック
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const { id: storyId } = await params
    const body = await request.json()
    const { documentsUrl } = body

    // バリデーション
    if (documentsUrl && typeof documentsUrl !== "string") {
      return NextResponse.json(
        { error: "URLの形式が正しくありません" },
        { status: 400 }
      )
    }

    // 体験談の存在確認
    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // documentsUrlを更新
    const updatedStory = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
        documentsUrl: documentsUrl || null,
      },
    })

    return NextResponse.json({
      message: "合格書類URLを更新しました",
      documentsUrl: updatedStory.documentsUrl,
    })
  } catch (error: any) {
    console.error("Error updating documents URL:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "合格書類URLの更新に失敗しました" },
      { status: 500 }
    )
  }
}
