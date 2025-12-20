import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, campus } = await request.json()

    // バリデーション
    if (!email || !password || !name || !campus) {
      return NextResponse.json(
        { error: "メールアドレス、パスワード、名前、所属校舎は必須です" },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー作成（デフォルトでUSERロール、approved=false）
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        campus,
        role: "USER",
        approved: false, // 管理者の承認待ち
      },
    })

    return NextResponse.json(
      {
        message: "アカウント登録が完了しました。管理者の承認をお待ちください。",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("サインアップエラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
