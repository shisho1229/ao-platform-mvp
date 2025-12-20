import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, canViewDocuments } from "@/lib/auth"

// GET /api/stories/[id] - 合格体験談詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    const story = await prisma.graduateStory.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            campus: true,
          }
        },
        explorationThemes: {
          include: {
            theme: true,
          }
        },
        concurrentApplications: true,
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // 公開されていない場合は管理者/スタッフのみ閲覧可能
    if (!story.published && (!currentUser || !canViewDocuments(currentUser.role))) {
      return NextResponse.json(
        { error: "この体験談は現在非公開です" },
        { status: 403 }
      )
    }

    // documentsUrlは管理者/スタッフのみに表示
    const responseStory = {
      ...story,
      documentsUrl: currentUser && canViewDocuments(currentUser.role) ? story.documentsUrl : undefined,
    }

    return NextResponse.json(responseStory)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json(
      { error: "体験談の取得に失敗しました" },
      { status: 500 }
    )
  }
}
