import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/users/[id]/promote-staff - スタッフ権限付与（SUPER_ADMIN、MANAGERのみ）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "MANAGER"])
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

    // 既にスタッフまたは管理者の場合はエラー
    if (targetUser.role === "STAFF" || targetUser.role === "MANAGER" || targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "このユーザーは既にスタッフ以上の権限を持っています" },
        { status: 400 }
      )
    }

    // スタッフ権限を付与
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "STAFF",
        approved: true, // スタッフは自動承認
      },
    })

    return NextResponse.json({
      message: "スタッフ権限を付与しました",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error("Error promoting to staff:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "最高管理者またはマネージャーのみがスタッフ権限を付与できます" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "スタッフ権限の付与に失敗しました" },
      { status: 500 }
    )
  }
}
