import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/users/[userId]/change-manager - ユーザーをマネージャーに変更（SUPER_ADMINのみ）
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // SUPER_ADMINのみが実行可能
    await requireRole(["SUPER_ADMIN"])

    const { userId } = params
    const body = await request.json()
    const { toManager } = body // true: マネージャーにする, false: USERに戻す

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    // 最高管理者は変更できない
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "最高管理者をマネージャーに変更できません" },
        { status: 400 }
      )
    }

    // ロールを変更
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: toManager ? "MANAGER" : "USER",
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: toManager ? "マネージャーに変更しました" : "一般ユーザーに戻しました",
    })
  } catch (error: any) {
    console.error("Error changing user to manager:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "最高管理者のみがマネージャーを任命できます" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "ユーザーの変更に失敗しました" },
      { status: 500 }
    )
  }
}
