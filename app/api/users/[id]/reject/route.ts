import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

// ユーザー拒否（削除）API（管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者権限チェック
    await requireRole(["ADMIN"])

    const { id: userId } = await params

    // ユーザーを削除
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "ユーザーを拒否（削除）しました" })
  } catch (error) {
    console.error("ユーザー拒否エラー:", error)
    if (error instanceof Error && error.message.includes("権限")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: "ユーザーの拒否に失敗しました" },
      { status: 500 }
    )
  }
}
