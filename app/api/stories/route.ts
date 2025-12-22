import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// GET /api/stories - 合格体験記一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get("keyword")
    const university = searchParams.get("university")
    const faculty = searchParams.get("faculty")
    const year = searchParams.get("year")
    const campus = searchParams.get("campus")
    const themeIds = searchParams.get("themeIds")?.split(",").map(Number)
    const sortBy = searchParams.get("sortBy") || "newest" // newest, popular, university

    // ページネーションパラメータ
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // AND条件を格納する配列
    const andConditions: Prisma.GraduateStoryWhereInput[] = [
      { published: true } // 公開されている体験記のみ
    ]

    // キーワード検索（OR条件）- 体験記の全ての内容を検索対象に
    if (keyword) {
      andConditions.push({
        OR: [
          { university: { contains: keyword, mode: 'insensitive' } },
          { faculty: { contains: keyword, mode: 'insensitive' } },
          { admissionType: { contains: keyword, mode: 'insensitive' } },
          { highSchoolName: { contains: keyword, mode: 'insensitive' } },
          { researchTheme: { contains: keyword, mode: 'insensitive' } },
          { researchMotivation: { contains: keyword, mode: 'insensitive' } },
          { researchDetails: { contains: keyword, mode: 'insensitive' } },
          { targetProfessor: { contains: keyword, mode: 'insensitive' } },
          { sportsDetails: { contains: keyword, mode: 'insensitive' } },
          { englishQualification: { contains: keyword, mode: 'insensitive' } },
          { studyAbroadDetails: { contains: keyword, mode: 'insensitive' } },
          { leaderExperienceDetails: { contains: keyword, mode: 'insensitive' } },
          { contestAchievementDetails: { contains: keyword, mode: 'insensitive' } },
          { interviewQuestions: { contains: keyword, mode: 'insensitive' } },
          { documentPreparation: { contains: keyword, mode: 'insensitive' } },
          { secondRoundPreparation: { contains: keyword, mode: 'insensitive' } },
          { materials: { contains: keyword, mode: 'insensitive' } },
          { authorName: { contains: keyword, mode: 'insensitive' } },
          { adviceToJuniors: { contains: keyword, mode: 'insensitive' } },
          { explorationThemes: {
            some: {
              theme: {
                name: { contains: keyword, mode: 'insensitive' }
              }
            }
          }},
        ]
      })
    }

    // 大学名フィルター
    if (university) {
      andConditions.push({ university: { contains: university } })
    }

    // 学部フィルター
    if (faculty) {
      andConditions.push({ faculty: { contains: faculty } })
    }

    // 年度フィルター
    if (year) {
      andConditions.push({ year: parseInt(year) })
    }

    // 校舎フィルター（投稿時に入力された校舎でフィルタリング）
    if (campus) {
      andConditions.push({ campus: campus })
    }

    // 探究テーマフィルター
    if (themeIds && themeIds.length > 0) {
      andConditions.push({
        explorationThemes: {
          some: {
            themeId: { in: themeIds }
          }
        }
      })
    }

    const where = {
      AND: andConditions
    }

    // ソート条件を設定
    let orderBy: Prisma.GraduateStoryOrderByWithRelationInput | Prisma.GraduateStoryOrderByWithRelationInput[] = { createdAt: "desc" } // デフォルト: 新着順

    if (sortBy === "popular") {
      // お気に入り数順（多い順）- Prismaでは直接カウントできないので後処理
      orderBy = { createdAt: "desc" } // 一旦新着順で取得
    } else if (sortBy === "university") {
      // 大学名順
      orderBy = [{ university: "asc" }, { createdAt: "desc" }]
    }

    // 総件数を取得
    const totalCount = await prisma.graduateStory.count({ where })

    const stories = await prisma.graduateStory.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            campus: true,
          }
        },
        explorationThemes: {
          include: {
            theme: true,
          }
        },
        concurrentApplications: true,
        favorites: {
          select: {
            id: true,
          }
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // お気に入り数を追加し、人気順の場合はソート
    const storiesWithFavorites = stories.map(story => ({
      ...story,
      favoritesCount: story.favorites.length,
      favorites: undefined, // favoriteの詳細は除外
    }))

    if (sortBy === "popular") {
      storiesWithFavorites.sort((a, b) => b.favoritesCount - a.favoritesCount)
    }

    // ページネーション情報を含めて返す
    return NextResponse.json({
      stories: storiesWithFavorites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      }
    })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json(
      { error: "体験記の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// POST /api/stories - 合格体験記投稿（ユーザー専用）
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["USER"])
    const body = await request.json()

    console.log("受信したデータ:", {
      ...body,
      explorationThemeIds: body.explorationThemeIds,
      concurrentApplications: body.concurrentApplications
    })

    const {
      status,
      authorName,
      gender,
      highSchoolLevel,
      highSchoolName,
      gradeAverage,
      campus,
      admissionType,
      university,
      faculty,
      year,
      explorationThemeIds,
      researchTheme,
      researchMotivation,
      researchDetails,
      targetProfessor,
      hasSportsAchievement,
      sportsDetails,
      sportsAchievements,
      hasEnglishQualification,
      englishQualification,
      hasStudyAbroad,
      studyAbroadDetails,
      hasLeaderExperience,
      leaderExperienceDetails,
      hasContestAchievement,
      contestAchievementDetails,
      interviewQuestions,
      selectionFlowType,
      firstRoundResult,
      secondRoundResult,
      documentPreparation,
      secondRoundPreparation,
      materials,
      adviceToJuniors,
      concurrentApplications,
    } = body

    // 下書きの場合はバリデーションをスキップ
    const isDraft = status === "DRAFT"

    // バリデーション（下書き以外）
    if (!isDraft && (!explorationThemeIds || !Array.isArray(explorationThemeIds) || explorationThemeIds.length === 0)) {
      return NextResponse.json(
        { error: "探究テーマを少なくとも1つ選択してください" },
        { status: 400 }
      )
    }

    // 体験記を作成（下書きまたは添削待ち状態）
    const story = await prisma.graduateStory.create({
      data: {
        authorId: user.id,
        authorName: authorName || null,
        gender: gender || null,
        highSchoolLevel: highSchoolLevel || "LEVEL_2",
        highSchoolName: highSchoolName || null,
        gradeAverage: gradeAverage || "RANGE_3",
        campus: campus || null,
        admissionType: admissionType || "",
        university: university || "",
        faculty: faculty || "",
        year: year ? parseInt(year) : null,
        status: isDraft ? "DRAFT" : "PENDING_REVIEW",
        published: false,
        researchTheme,
        researchMotivation,
        researchDetails,
        targetProfessor,
        hasSportsAchievement,
        sportsDetails,
        sportsAchievements: sportsAchievements || [],
        hasEnglishQualification,
        englishQualification,
        hasStudyAbroad,
        studyAbroadDetails,
        hasLeaderExperience,
        leaderExperienceDetails,
        hasContestAchievement,
        contestAchievementDetails,
        interviewQuestions,
        selectionFlowType,
        firstRoundResult,
        secondRoundResult,
        documentPreparation,
        secondRoundPreparation,
        materials,
        adviceToJuniors,
        explorationThemes: explorationThemeIds && explorationThemeIds.length > 0
          ? {
              create: explorationThemeIds.map((themeId: number) => ({
                themeId,
              })),
            }
          : undefined,
        concurrentApplications: concurrentApplications
          ? {
              create: concurrentApplications,
            }
          : undefined,
      },
      include: {
        explorationThemes: {
          include: {
            theme: true,
          },
        },
        concurrentApplications: true,
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error("Error creating story:", error)

    const err = error as Error & { code?: string; meta?: unknown }
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack
    })

    if (err.message === "権限がありません") {
      return NextResponse.json(
        { error: "合格者のみ体験記を投稿できます" },
        { status: 403 }
      )
    }

    // Prismaエラーの詳細を返す（開発環境用）
    const errorMessage = err.message || "体験記の投稿に失敗しました"
    const errorDetails = err.code ? ` (Code: ${err.code})` : ""

    return NextResponse.json(
      {
        error: `体験記の投稿に失敗しました: ${errorMessage}${errorDetails}`,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    )
  }
}
