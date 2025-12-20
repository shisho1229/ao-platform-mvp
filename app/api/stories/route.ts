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

    const where: any = {}

    // キーワード検索（大学名、学部、入試方式、活動内容、名前などで検索）
    if (keyword) {
      where.OR = [
        { university: { contains: keyword, mode: 'insensitive' } },
        { faculty: { contains: keyword, mode: 'insensitive' } },
        { admissionType: { contains: keyword, mode: 'insensitive' } },
        { activityContent: { contains: keyword, mode: 'insensitive' } },
        { activityResults: { contains: keyword, mode: 'insensitive' } },
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

    const {
      gender,
      highSchoolLevel,
      gradeAverage,
      admissionType,
      university,
      faculty,
      year,
      explorationThemeIds,
      activityContent,
      activityResults,
      hasSportsAchievement,
      sportsAchievement,
      englishLevel,
      englishDetail,
      hasStudyAbroad,
      hasLeaderExperience,
      leaderExperience,
      interviewQuestions,
      documentThemes,
      selectionFlowType,
      firstRoundResult,
      secondRoundResult,
      preparationMethod,
      materials,
      adviceToJuniors,
      concurrentApplications,
    } = body

    // 体験談を作成
    const story = await prisma.graduateStory.create({
      data: {
        authorId: user.id,
        gender: gender || null,
        highSchoolLevel,
        gradeAverage,
        admissionType,
        university,
        faculty,
        year: year || null,
        activityContent,
        activityResults,
        hasSportsAchievement,
        sportsAchievement,
        englishLevel,
        englishDetail,
        hasStudyAbroad,
        hasLeaderExperience,
        leaderExperience,
        interviewQuestions,
        documentThemes,
        selectionFlowType,
        firstRoundResult,
        secondRoundResult,
        preparationMethod,
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

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "合格者のみ体験談を投稿できます" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "体験談の投稿に失敗しました" },
      { status: 500 }
    )
  }
}
