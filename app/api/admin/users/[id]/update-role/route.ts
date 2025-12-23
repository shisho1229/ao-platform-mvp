import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/users/[id]/update-role - ロール変更（SUPER_ADMINのみ）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireRole(["SUPER_ADMIN"])
    const { id: userId } = await params
    const { role } = await request.json()

    // 有効なロールかチェック
    const validRoles = ["USER", "STAFF", "SUPER_ADMIN"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "無効なロールです" },
        { status: 400 }
      )
    }

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

    // 自分自身のロールは変更できない
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { error: "自分自身のロールは変更できません" },
        { status: 400 }
      )
    }

    // 既に同じロールの場合
    if (targetUser.role === role) {
      return NextResponse.json(
        { error: "既に同じロールです" },
        { status: 400 }
      )
    }

    // ロールを更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        approved: role !== "USER" ? true : targetUser.approved, // STAFF/SUPER_ADMINは自動承認
      },
    })

    const roleLabels: Record<string, string> = {
      USER: "一般ユーザー",
      STAFF: "スタッフ",
      SUPER_ADMIN: "最高管理者",
    }

    return NextResponse.json({
      message: `${roleLabels[role]}に変更しました`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error("Error updating role:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "最高管理者のみがロールを変更できます" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "ロールの変更に失敗しました" },
      { status: 500 }
    )
  }
}
