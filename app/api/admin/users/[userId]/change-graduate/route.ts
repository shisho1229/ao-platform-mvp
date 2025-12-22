import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/users/[userId]/change-graduate - ユーザーを卒塾生に変更
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // SUPER_ADMIN、ADMIN、STAFFのみが実行可能
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])

    const { userId } = params
    const body = await request.json()
    const { toGraduate } = body // true: 卒塾生にする, false: USERに戻す

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

    // 最高管理者やスタッフは変更できない
    if (user.role === "SUPER_ADMIN" || user.role === "STAFF" || user.role === "ADMIN") {
      return NextResponse.json(
        { error: "管理者・スタッフは卒塾生に変更できません" },
        { status: 400 }
      )
    }

    // ロールを変更
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: toGraduate ? "GRADUATE" : "USER",
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: toGraduate ? "卒塾生に変更しました" : "一般ユーザーに戻しました",
    })
  } catch (error: any) {
    console.error("Error changing user to graduate:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "ユーザーの変更に失敗しました" },
      { status: 500 }
    )
  }
}
