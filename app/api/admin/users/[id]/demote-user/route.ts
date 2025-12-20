import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/users/[id]/demote-user - スタッフ権限を削除してUSERに降格（SUPER_ADMINのみ）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN"])
    const { id: userId } = await params

    // 対象ユーザーを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    // SUPER_ADMINは降格できない
    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "最高管理者を降格することはできません" },
        { status: 400 }
      )
    }

    // 既にUSERの場合はエラー
    if (targetUser.role === "USER") {
      return NextResponse.json(
        { error: "このユーザーは既に一般ユーザーです" },
        { status: 400 }
      )
    }

    // ユーザー権限に降格
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "USER",
      },
    })

    return NextResponse.json({
      message: "ユーザー権限に降格しました",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error("Error demoting user:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "最高管理者のみが権限を変更できます" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "権限の変更に失敗しました" },
      { status: 500 }
    )
  }
}
