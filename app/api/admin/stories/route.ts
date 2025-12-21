import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/stories - 管理者用体験記一覧取得（非公開も含む）
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get("published")
    const status = searchParams.get("status")

    const where: any = {}

    // ステータスフィルター（添削待ち、修正依頼中など）
    if (status) {
      where.status = status
    }

    // 公開/非公開フィルター
    if (published === "true") {
      where.published = true
    } else if (published === "false") {
      where.published = false
    }

    const stories = await prisma.graduateStory.findMany({
      where,
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
    console.error("Error fetching stories:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "体験記の取得に失敗しました" },
      { status: 500 }
    )
  }
}
