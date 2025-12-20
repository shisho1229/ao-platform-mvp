import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { isSuperAdminEmail } from "@/lib/auth"

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

    // ロールと承認ステータスを決定
    const isSuperAdmin = isSuperAdminEmail(email)
    const userRole = isSuperAdmin ? "SUPER_ADMIN" : "USER"
    const isApproved = isSuperAdmin // 最高管理者は自動承認

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        campus,
        role: userRole,
        approved: isApproved,
      },
    })

    return NextResponse.json(
      {
        message: isSuperAdmin
          ? "最高管理者アカウントが作成されました。すぐにログインできます。"
          : "アカウント登録が完了しました。管理者の承認をお待ちください。",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
