import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/stories/my - 自分の投稿一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const stories = await prisma.graduateStory.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error fetching my stories:", error)
    return NextResponse.json(
      { error: "体験記の取得に失敗しました" },
      { status: 500 }
    )
  }
}
