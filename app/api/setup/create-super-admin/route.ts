import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// セキュリティトークン（一時的に使用、使用後は必ず削除してください）
const SETUP_TOKEN = "SETUP_SUPER_ADMIN_2024"

// POST /api/setup/create-super-admin
// このエンドポイントは一時的なものです。使用後は必ず削除してください。
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    // セキュリティトークンの検証
    if (token !== SETUP_TOKEN) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      )
    }

    const email = "musashikosugi@juku.loohcs.co.jp"
    const password = "ChangeMe123!" // 初回ログイン後に必ず変更してください
    const name = "武蔵小杉管理者"
    const campus = "武蔵小杉"

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // 既存ユーザーをSUPER_ADMINに昇格
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: "SUPER_ADMIN",
          approved: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: "既存ユーザーをSUPER_ADMINに昇格しました",
        user: {
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      })
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // 新しいSUPER_ADMINユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        campus,
        role: "SUPER_ADMIN",
        approved: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "SUPER_ADMINアカウントを作成しました",
      credentials: {
        email,
        password,
        warning: "⚠️ 初回ログイン後に必ずパスワードを変更してください！",
      },
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Error creating SUPER_ADMIN:", error)
    return NextResponse.json(
      { error: "SUPER_ADMINの作成に失敗しました", details: error.message },
      { status: 500 }
    )
  }
}
