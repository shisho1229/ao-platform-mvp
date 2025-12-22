import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/stats - 管理者用統計データ取得
export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "MANAGER", "STAFF"])

    // 並列で全ての統計を取得
    const [
      totalUsers,
      totalStories,
      publishedStories,
      pendingStories,
      draftStories,
      totalFavorites,
      usersByRole,
      storiesByStatus,
      recentStories,
      topUniversities,
    ] = await Promise.all([
      // ユーザー数
      prisma.user.count(),

      // 総投稿数
      prisma.graduateStory.count(),

      // 公開中の体験記数
      prisma.graduateStory.count({
        where: { published: true, status: "PUBLISHED" }
      }),

      // 添削待ちの体験記数
      prisma.graduateStory.count({
        where: { status: "PENDING_REVIEW" }
      }),

      // 下書きの体験記数
      prisma.graduateStory.count({
        where: { status: "DRAFT" }
      }),

      // お気に入り総数
      prisma.favorite.count(),

      // ロール別ユーザー数
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true }
      }),

      // ステータス別体験記数
      prisma.graduateStory.groupBy({
        by: ["status"],
        _count: { id: true }
      }),

      // 最近の投稿（7日以内）
      prisma.graduateStory.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // 大学別投稿数（上位10件）
      prisma.graduateStory.groupBy({
        by: ["university"],
        _count: { id: true },
        where: { published: true },
        orderBy: { _count: { id: "desc" } },
        take: 10
      })
    ])

    // お気に入りが多い体験記トップ5
    const topStories = await prisma.graduateStory.findMany({
      where: { published: true },
      include: {
        favorites: {
          select: { id: true }
        }
      },
      take: 100 // まず100件取得してソート
    })

    const topStoriesSorted = topStories
      .map(story => ({
        id: story.id,
        university: story.university,
        faculty: story.faculty,
        favoritesCount: story.favorites.length
      }))
      .sort((a, b) => b.favoritesCount - a.favoritesCount)
      .slice(0, 5)

    const stats = {
      overview: {
        totalUsers,
        totalStories,
        publishedStories,
        pendingStories,
        draftStories,
        totalFavorites,
        recentStories
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.id
      })),
      storiesByStatus: storiesByStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      topUniversities: topUniversities.map(item => ({
        university: item.university,
        count: item._count.id
      })),
      topStories: topStoriesSorted
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Error fetching stats:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "統計データの取得に失敗しました" },
      { status: 500 }
    )
  }
}
