import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

// 承認待ちユーザー一覧取得API（管理者のみ）
export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    await requireRole(["SUPER_ADMIN", "MANAGER", "ADMIN", "STAFF"])

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const campus = searchParams.get("campus")

    const where: any = { approved: false }

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

    // 承認待ちのユーザーを取得
    const pendingUsers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        campus: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error("承認待ちユーザー取得エラー:", error)
    if (error instanceof Error && error.message.includes("権限")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: "承認待ちユーザーの取得に失敗しました" },
      { status: 500 }
    )
  }
}
