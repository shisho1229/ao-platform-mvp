import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/test-create - 最小限のテスト投稿を作成
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    // ユーザーを取得
    const user = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF", "USER"] } },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 400 })
    }

    // 最小限のフィールドでテスト
    const testStory = await prisma.graduateStory.create({
      data: {
        authorId: user.id,
        highSchoolLevel: "LEVEL_3",
        highSchoolName: "テスト高校",
        gradeAverage: "RANGE_4",
        admissionType: "テスト入試",
        university: "テスト大学",
        faculty: "テスト学部",
        status: "PUBLISHED",
        published: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "テスト投稿を作成しました",
      story: {
        id: testStory.id,
        university: testStory.university,
      },
    })
  } catch (error) {
    console.error("テスト投稿作成エラー:", error)
    return NextResponse.json(
      { error: "テスト投稿の作成に失敗しました", details: String(error) },
      { status: 500 }
    )
  }
}
