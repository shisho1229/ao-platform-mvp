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

    return NextResponse.json(themes)
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { error: "探究テーマの取得に失敗しました" },
      { status: 500 }
    )
  }
}
