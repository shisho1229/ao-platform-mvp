import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/themes - 探究テーマ一覧取得
export async function GET() {
  try {
    const themes = await prisma.explorationTheme.findMany({
      orderBy: {
        id: "asc",
      },
    })

    // キャッシュヘッダーを設定（1時間キャッシュ、24時間はstale-while-revalidate）
    return NextResponse.json(themes, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { error: "探究テーマの取得に失敗しました" },
      { status: 500 }
    )
  }
}
