import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/favorites - お気に入り一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        story: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "お気に入りの取得に失敗しました" },
      { status: 500 }
    )
  }
}
