import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/stories - 管理者用体験記一覧取得（非公開も含む）
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "MANAGER", "ADMIN", "STAFF"])

    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get("published")
    const status = searchParams.get("status")
    const university = searchParams.get("university")
    const faculty = searchParams.get("faculty")
    const year = searchParams.get("year")
    const campus = searchParams.get("campus")
    const admissionResult = searchParams.get("admissionResult") // "first_pass" or "final_pass"

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

    // 大学フィルター
    if (university) {
      where.university = { contains: university }
    }

    // 学部フィルター
    if (faculty) {
      where.faculty = { contains: faculty }
    }

    // 年度フィルター
    if (year) {
      where.year = parseInt(year)
    }

    // 校舎フィルター
    if (campus) {
      where.campus = campus
    }

    // 合否情報フィルター
    if (admissionResult === "first_pass") {
      // 一次合格のみ（二次は不合格または未記入）
      where.firstRoundResult = { in: ["合格", "AB合格", "A合格", "B合格"] }
      // 最終合格者を除外
      where.NOT = {
        secondRoundResult: { in: ["合格", "AB合格", "A合格", "B合格"] }
      }
    } else if (admissionResult === "final_pass") {
      // 最終合格（二次合格）
      where.secondRoundResult = { in: ["合格", "AB合格", "A合格", "B合格"] }
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
