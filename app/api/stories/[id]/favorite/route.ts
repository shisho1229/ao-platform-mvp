import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/stories/[id]/favorite - お気に入りに追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // 体験談が存在するか確認
    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // お気に入りに追加（既に存在する場合はエラーにならない）
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_storyId: {
          userId: session.user.id,
          storyId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        storyId,
      },
    })

    return NextResponse.json({ message: "お気に入りに追加しました", favorite })
  } catch (error: any) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "お気に入りの追加に失敗しました" },
      { status: 500 }
    )
  }
}

// DELETE /api/stories/[id]/favorite - お気に入りから削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // お気に入りから削除
    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        storyId,
      },
    })

    return NextResponse.json({ message: "お気に入りから削除しました" })
  } catch (error: any) {
    console.error("Error removing favorite:", error)
    return NextResponse.json(
      { error: "お気に入りの削除に失敗しました" },
      { status: 500 }
    )
  }
}
