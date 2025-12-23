import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// DELETE /api/users/me/delete - アカウント退会（自分自身のみ）
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "パスワードを入力してください" },
        { status: 400 }
      )
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    // パスワード確認
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 400 }
      )
    }

    // ユーザーに関連するデータを削除
    // 1. お気に入りを削除
    await prisma.favorite.deleteMany({
      where: { userId: session.user.id },
    })

    // 2. 体験記を削除（関連する探究テーマの関連も自動削除される）
    await prisma.graduateStory.deleteMany({
      where: { authorId: session.user.id },
    })

    // 3. ユーザーを削除
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({
      message: "アカウントを削除しました",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "アカウントの削除に失敗しました" },
      { status: 500 }
    )
  }
}
