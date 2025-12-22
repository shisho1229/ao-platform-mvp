import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/stories/[id]/toggle-publish - 公開/非公開切り替え
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "MANAGER", "ADMIN", "STAFF"])
    const { id: storyId } = await params

    // 現在の状態を取得
    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
      select: { published: true, status: true },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験記が見つかりません" },
        { status: 404 }
      )
    }

    // 公開する場合はステータスをPUBLISHEDに、非公開にする場合はPENDING_REVIEWに
    const newPublishedStatus = !story.published
    const newStatus = newPublishedStatus ? "PUBLISHED" : "PENDING_REVIEW"

    // 公開状態を切り替え
    const updatedStory = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
        published: newPublishedStatus,
        status: newStatus,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            campus: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: updatedStory.published ? "体験記を公開しました" : "体験記を非公開にしました",
      story: updatedStory,
    })
  } catch (error: any) {
    console.error("Error toggling publish status:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "公開状態の切り替えに失敗しました" },
      { status: 500 }
    )
  }
}
