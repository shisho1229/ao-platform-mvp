import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/users - 承認済みユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const searchParams = request.nextUrl.searchParams
    const approved = searchParams.get("approved")
    const search = searchParams.get("search")
    const campus = searchParams.get("campus")

    const where: any = {}

    if (approved === "true") {
      where.approved = true
    } else if (approved === "false") {
      where.approved = false
    }

    // 検索フィルター（名前またはメールアドレス）
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 校舎フィルター
    if (campus) {
      where.campus = campus
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        campus: true,
        role: true,
        approved: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Error fetching users:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "ユーザーの取得に失敗しました" },
      { status: 500 }
    )
  }
}
