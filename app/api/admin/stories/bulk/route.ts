import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/stories/bulk - 一括操作
export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "MANAGER", "STAFF"])
    const body = await request.json()
    const { action, storyIds } = body

    if (!action || !storyIds || !Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json(
        { error: "アクションとストーリーIDを指定してください" },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case "publish":
        // 一括公開
        result = await prisma.graduateStory.updateMany({
          where: {
            id: { in: storyIds },
            status: "PUBLISHED"
          },
          data: {
            published: true
          }
        })
        break

      case "unpublish":
        // 一括非公開
        result = await prisma.graduateStory.updateMany({
          where: {
            id: { in: storyIds }
          },
          data: {
            published: false
          }
        })
        break

      case "approve":
        // 一括承認（公開設定）
        result = await prisma.graduateStory.updateMany({
          where: {
            id: { in: storyIds },
            status: "PENDING_REVIEW"
          },
          data: {
            status: "PUBLISHED",
            published: true
          }
        })
        break

      case "delete":
        // 一括削除
        result = await prisma.graduateStory.deleteMany({
          where: {
            id: { in: storyIds }
          }
        })
        break

      default:
        return NextResponse.json(
          { error: "無効なアクションです" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count}件の体験記を${action === "publish" ? "公開" : action === "unpublish" ? "非公開" : action === "approve" ? "承認" : "削除"}しました`
    })
  } catch (error: any) {
    console.error("Error in bulk operation:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "一括操作に失敗しました" },
      { status: 500 }
    )
  }
}
