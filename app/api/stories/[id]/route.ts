import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/stories/[id] - 合格体験談詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const story = await prisma.graduateStory.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
          }
        },
        explorationThemes: {
          include: {
            theme: true,
          }
        },
        concurrentApplications: true,
        admissionDocuments: {
          select: {
            id: true,
            documentType: true,
            fileName: true,
            createdAt: true,
          }
        }
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json(
      { error: "体験談の取得に失敗しました" },
      { status: 500 }
    )
  }
}
