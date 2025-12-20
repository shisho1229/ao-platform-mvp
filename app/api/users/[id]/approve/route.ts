import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

// ユーザー承認API（管理者のみ）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者権限チェック
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const { id: userId } = await params

    // ユーザーを承認
    const user = await prisma.user.update({
      where: { id: userId },
      data: { approved: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
      },
    })

    return NextResponse.json({ message: "ユーザーを承認しました", user })
  } catch (error) {
    console.error("ユーザー承認エラー:", error)
    if (error instanceof Error && error.message.includes("権限")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: "ユーザーの承認に失敗しました" },
      { status: 500 }
    )
  }
}
