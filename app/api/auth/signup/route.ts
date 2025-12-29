import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { isSuperAdminEmail } from "@/lib/auth"
import { isValidEmail, isStrongPassword, checkRateLimit, getClientIP, sanitizeInput } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック（1時間に5回まで）
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`signup:${clientIP}`, 5, 60 * 60 * 1000)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "登録リクエストが多すぎます。しばらく待ってからお試しください。" },
        { status: 429 }
      )
    }

    const { email, password, name, campus } = await request.json()

    // 基本バリデーション
    if (!email || !password || !name || !campus) {
      return NextResponse.json(
        { error: "メールアドレス、パスワード、名前、所属校舎は必須です" },
        { status: 400 }
      )
    }

    // メールアドレス形式チェック
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      )
    }

    // パスワード強度チェック
    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      )
    }

    // 入力サニタイズ
    const sanitizedName = sanitizeInput(name)
    const sanitizedCampus = sanitizeInput(campus)

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

    // ユーザー作成（サニタイズ済みの入力を使用）
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: sanitizedName,
        campus: sanitizedCampus,
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
