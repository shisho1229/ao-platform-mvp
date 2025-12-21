import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/stories/[id] - 体験談詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params

    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            campus: true,
          },
        },
        explorationThemes: {
          include: {
            theme: true,
          },
        },
        concurrentApplications: true,
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // 公開されていない体験談は、投稿者本人と管理者のみ閲覧可能
    if (!story.published) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          { error: "この体験談は非公開です" },
          { status: 403 }
        )
      }

      const isAdmin = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.user.role)
      const isAuthor = session.user.id === story.authorId

      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: "この体験談は非公開です" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json(
      { error: "体験談の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// PATCH /api/stories/[id] - 体験談更新（投稿者本人と管理者のみ）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // 体験談の存在確認と権限チェック
    const story = await prisma.graduateStory.findUnique({
      where: { id: storyId },
      select: { id: true, authorId: true },
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // 投稿者本人または管理者のみ編集可能
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.user.role)
    const isAuthor = session.user.id === story.authorId

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "編集権限がありません。編集できるのは投稿者本人と管理者のみです。" },
        { status: 403 }
      )
    }

    const body = await request.json()

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
    if (explorationThemeIds && (!Array.isArray(explorationThemeIds) || explorationThemeIds.length === 0)) {
      return NextResponse.json(
        { error: "探究テーマを少なくとも1つ選択してください" },
        { status: 400 }
      )
    }

    // 既存の探究テーマと併願校を削除
    await prisma.storyExplorationTheme.deleteMany({
      where: { storyId },
    })

    await prisma.concurrentApplication.deleteMany({
      where: { storyId },
    })

    // 体験談を更新
    const updatedStory = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
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
          create: explorationThemeIds?.map((themeId: number) => ({
            themeId,
          })) || [],
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

    return NextResponse.json(updatedStory)
  } catch (error: any) {
    console.error("Error updating story:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })

    // Prismaエラーの詳細を返す（開発環境用）
    const errorMessage = error.message || "体験談の更新に失敗しました"
    const errorDetails = error.code ? ` (Code: ${error.code})` : ""

    return NextResponse.json(
      {
        error: `体験談の更新に失敗しました: ${errorMessage}${errorDetails}`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
