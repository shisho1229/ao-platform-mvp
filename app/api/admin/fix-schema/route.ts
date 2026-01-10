import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/fix-schema - データベーススキーマを修正
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    // カラムの型を確認
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'graduate_stories'
      ORDER BY ordinal_position
    ` as any[]

    // 問題のあるカラムを特定
    const problematicColumns = columns.filter(col =>
      col.udt_name === '_text' || // TEXT[] の場合
      col.data_type === 'ARRAY'
    )

    // sportsAchievements 以外に配列カラムがあれば問題
    const unexpectedArrays = problematicColumns.filter(col =>
      col.column_name !== 'sportsAchievements'
    )

    if (unexpectedArrays.length > 0) {
      // 問題のあるカラムをTEXTに修正
      for (const col of unexpectedArrays) {
        console.log(`Fixing column: ${col.column_name}`)
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "graduate_stories"
          ALTER COLUMN "${col.column_name}" TYPE TEXT
          USING "${col.column_name}"::TEXT
        `)
      }
    }

    return NextResponse.json({
      success: true,
      message: "スキーマを確認しました",
      columns: columns.map(c => ({
        name: c.column_name,
        type: c.data_type,
        udt: c.udt_name
      })),
      problematicColumns: problematicColumns.map(c => c.column_name),
      fixed: unexpectedArrays.map(c => c.column_name)
    })
  } catch (error) {
    console.error("スキーマ修正エラー:", error)
    return NextResponse.json(
      { error: "スキーマ修正に失敗しました", details: String(error) },
      { status: 500 }
    )
  }
}

// GET /api/admin/fix-schema - カラム情報を取得
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'graduate_stories'
      ORDER BY ordinal_position
    ` as any[]

    const arrayColumns = columns.filter(col =>
      col.udt_name === '_text' ||
      col.data_type === 'ARRAY'
    )

    return NextResponse.json({
      totalColumns: columns.length,
      columns: columns.map(c => ({
        name: c.column_name,
        type: c.data_type,
        udt: c.udt_name
      })),
      arrayColumns: arrayColumns.map(c => c.column_name)
    })
  } catch (error) {
    console.error("カラム取得エラー:", error)
    return NextResponse.json(
      { error: "カラム取得に失敗しました", details: String(error) },
      { status: 500 }
    )
  }
}
