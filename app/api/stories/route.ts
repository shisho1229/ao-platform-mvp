import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/stories - 合格体験談一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const university = searchParams.get("university")
    const faculty = searchParams.get("faculty")
    const themeIds = searchParams.get("themeIds")?.split(",").map(Number)

    const where: any = {}

    if (university) {
      where.university = { contains: university }
    }

    if (faculty) {
      where.faculty = { contains: faculty }
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

// POST /api/stories - 合格体験談投稿（Graduate専用）
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["GRADUATE"])
    const body = await request.json()

    const {
      gender,
      highSchoolLevel,
      gradeAverage,
      admissionType,
      university,
      faculty,
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
