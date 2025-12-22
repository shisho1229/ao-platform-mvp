import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/stories/draft - 下書きを取得
export async function GET() {
  try {
    const user = await requireRole(["USER"])

    const draft = await prisma.storyDraft.findUnique({
      where: { userId: user.id },
    })

    if (!draft) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({
      data: JSON.parse(draft.data),
      updatedAt: draft.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching draft:", error)
    return NextResponse.json(
      { error: "下書きの取得に失敗しました" },
      { status: 500 }
    )
  }
}

// POST /api/stories/draft - 下書きを保存
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["USER"])
    const body = await request.json()

    const draft = await prisma.storyDraft.upsert({
      where: { userId: user.id },
      update: {
        data: JSON.stringify(body),
      },
      create: {
        userId: user.id,
        data: JSON.stringify(body),
      },
    })

    return NextResponse.json({
      message: "下書きを保存しました",
      updatedAt: draft.updatedAt,
    })
  } catch (error) {
    console.error("Error saving draft:", error)
    return NextResponse.json(
      { error: "下書きの保存に失敗しました" },
      { status: 500 }
    )
  }
}

// DELETE /api/stories/draft - 下書きを削除
export async function DELETE() {
  try {
    const user = await requireRole(["USER"])

    await prisma.storyDraft.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      message: "下書きを削除しました",
    })
  } catch (error) {
    console.error("Error deleting draft:", error)
    return NextResponse.json(
      { error: "下書きの削除に失敗しました" },
      { status: 500 }
    )
  }
}
