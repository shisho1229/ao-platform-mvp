import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/debug-stories - 体験記のデバッグ情報を取得
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    // 全体験記のステータス確認
    const stories = await prisma.graduateStory.findMany({
      select: {
        id: true,
        university: true,
        faculty: true,
        status: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        authorName: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // 統計
    const counts = await prisma.graduateStory.groupBy({
      by: ["status", "published"],
      _count: true,
    })

    return NextResponse.json({
      total: stories.length,
      stories: stories.map(s => ({
        id: s.id,
        university: s.university,
        faculty: s.faculty,
        status: s.status,
        published: s.published,
        authorName: s.authorName,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      statusCounts: counts,
    })
  } catch (error) {
    console.error("デバッグエラー:", error)
    return NextResponse.json(
      { error: "デバッグ情報の取得に失敗しました", details: String(error) },
      { status: 500 }
    )
  }
}
