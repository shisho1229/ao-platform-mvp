import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/stories/pending - 承認待ち体験記一覧取得
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const stories = await prisma.graduateStory.findMany({
      where: {
        status: "PENDING_REVIEW",
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
  } catch (error: any) {
    console.error("Error fetching pending stories:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "承認待ち体験記の取得に失敗しました" },
      { status: 500 }
    )
  }
}
