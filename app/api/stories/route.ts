import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/stories - 合格体験談一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get("keyword")
    const university = searchParams.get("university")
    const faculty = searchParams.get("faculty")
    const year = searchParams.get("year")
    const campus = searchParams.get("campus")
    const themeIds = searchParams.get("themeIds")?.split(",").map(Number)

    const where: any = {
      published: true, // 公開されている体験談のみ
    }

    // キーワード検索（大学名、学部、入試方式、高校名、探究テーマ、名前などで検索）
    if (keyword) {
      where.OR = [
        { university: { contains: keyword, mode: 'insensitive' } },
        { faculty: { contains: keyword, mode: 'insensitive' } },
        { admissionType: { contains: keyword, mode: 'insensitive' } },
        { highSchoolName: { contains: keyword, mode: 'insensitive' } },
        { researchTheme: { contains: keyword, mode: 'insensitive' } },
        { researchDetails: { contains: keyword, mode: 'insensitive' } },
        { contestAchievementDetails: { contains: keyword, mode: 'insensitive' } },
        { preparationMethod: { contains: keyword, mode: 'insensitive' } },
        { adviceToJuniors: { contains: keyword, mode: 'insensitive' } },
        { author: { name: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    if (university) {
      where.university = { contains: university }
    }

    if (faculty) {
      where.faculty = { contains: faculty }
    }

    if (year) {
      where.year = parseInt(year)
    }

    if (campus) {
      where.author = {
        campus: campus
      }
    }

    if (themeIds && themeIds.length > 0) {
      where.explorationThemes = {
        some: {
          themeId: { in: themeIds }
        }
      }
    }

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
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json(
      { error: "体験談の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// POST /api/stories - 合格体験談投稿（ユーザー専用）
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

    // バリデーション
    if (!explorationThemeIds || !Array.isArray(explorationThemeIds) || explorationThemeIds.length === 0) {
      return NextResponse.json(
        { error: "探究テーマを少なくとも1つ選択してください" },
        { status: 400 }
      )
    }

    // 体験談を作成（最初は非公開）
    const story = await prisma.graduateStory.create({
      data: {
        authorId: user.id,
        authorName: authorName || null,
        gender: gender || null,
        highSchoolLevel,
        highSchoolName: highSchoolName || null,
        gradeAverage,
        campus: campus || null,
        admissionType,
        university,
        faculty,
        year: year ? parseInt(year) : null,
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
        explorationThemes: {
          create: explorationThemeIds.map((themeId: number) => ({
            themeId,
          })),
        },
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
  } catch (error: any) {
    console.error("Error creating story:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "合格者のみ体験談を投稿できます" },
        { status: 403 }
      )
    }

    // Prismaエラーの詳細を返す（開発環境用）
    const errorMessage = error.message || "体験談の投稿に失敗しました"
    const errorDetails = error.code ? ` (Code: ${error.code})` : ""

    return NextResponse.json(
      {
        error: `体験談の投稿に失敗しました: ${errorMessage}${errorDetails}`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
