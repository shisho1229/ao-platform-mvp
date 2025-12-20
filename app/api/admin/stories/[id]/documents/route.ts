import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/stories/[id]/documents - 合格書類URL追加/更新
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params
    const { documentsUrl } = await request.json()

    if (!documentsUrl || typeof documentsUrl !== "string") {
      return NextResponse.json(
        { error: "書類URLを入力してください" },
        { status: 400 }
      )
    }

    // URLのバリデーション（簡易的）
    try {
      new URL(documentsUrl)
    } catch {
      return NextResponse.json(
        { error: "有効なURLを入力してください" },
        { status: 400 }
      )
    }

    // 書類URLを更新
    const updatedStory = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
        documentsUrl,
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
      message: "書類URLを更新しました",
      story: updatedStory,
    })
  } catch (error: any) {
    console.error("Error updating documents URL:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "書類URLの更新に失敗しました" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/stories/[id]/documents - 合格書類URL削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params

    // 書類URLを削除
    const updatedStory = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
        documentsUrl: null,
      },
    })

    return NextResponse.json({
      message: "書類URLを削除しました",
      story: updatedStory,
    })
  } catch (error: any) {
    console.error("Error deleting documents URL:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "書類URLの削除に失敗しました" },
      { status: 500 }
    )
  }
}
