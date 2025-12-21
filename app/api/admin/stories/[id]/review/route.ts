import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/stories/[id]/review - 体験記のステータス変更（承認、修正依頼）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params
    const body = await request.json()

    const { action, reviewNotes } = body

    if (!action || !["approve", "request_revision"].includes(action)) {
      return NextResponse.json(
        { error: "無効なアクションです" },
        { status: 400 }
      )
    }

    // アクションに応じてステータスを更新
    const updateData: any = {}

    if (action === "approve") {
      // 承認：公開状態にする
      updateData.status = "PUBLISHED"
      updateData.published = true
      updateData.reviewNotes = null // 修正依頼メモをクリア
    } else if (action === "request_revision") {
      // 修正依頼：修正待ち状態にする
      if (!reviewNotes?.trim()) {
        return NextResponse.json(
          { error: "修正依頼の内容を入力してください" },
          { status: 400 }
        )
      }
      updateData.status = "NEEDS_REVISION"
      updateData.published = false
      updateData.reviewNotes = reviewNotes
    }

    const story = await prisma.graduateStory.update({
      where: { id: storyId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            campus: true,
          },
        },
        explorationThemes: {
          include: {
            theme: true,
          },
        },
        concurrentApplications: true,
      },
    })

    return NextResponse.json({
      message: action === "approve" ? "体験記を承認しました" : "修正を依頼しました",
      story,
    })
  } catch (error: any) {
    console.error("Error reviewing story:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "体験記が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "ステータスの更新に失敗しました" },
      { status: 500 }
    )
  }
}
