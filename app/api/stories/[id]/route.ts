import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, canViewDocuments } from "@/lib/auth"

// GET /api/stories/[id] - 合格体験談詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    const story = await prisma.graduateStory.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
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
    })

    if (!story) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // 公開されていない場合は管理者/スタッフのみ閲覧可能
    if (!story.published && (!currentUser || !canViewDocuments(currentUser.role))) {
      return NextResponse.json(
        { error: "この体験談は現在非公開です" },
        { status: 403 }
      )
    }

    // documentsUrlは管理者/スタッフのみに表示
    const responseStory = {
      ...story,
      documentsUrl: currentUser && canViewDocuments(currentUser.role) ? story.documentsUrl : undefined,
    }

    return NextResponse.json(responseStory)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json(
      { error: "体験談の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// PUT /api/stories/[id] - 合格体験談更新（投稿者本人のみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // 既存の体験談を取得
    const existingStory = await prisma.graduateStory.findUnique({
      where: { id },
    })

    if (!existingStory) {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    // 管理者または投稿者本人かチェック
    const isAdmin = currentUser.role === "SUPER_ADMIN" ||
                    currentUser.role === "ADMIN" ||
                    currentUser.role === "STAFF"
    const isAuthor = existingStory.authorId === currentUser.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "この体験談を編集する権限がありません" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 探究テーマの接続データを作成
    const explorationThemesData = body.explorationThemeIds?.map((themeId: number) => ({
      themeId,
    })) || []

    // 併願校データを作成
    const concurrentApplicationsData = body.concurrentApplications?.map((app: any) => ({
      university: app.university,
      faculty: app.faculty,
      result: app.result,
    })) || []

    // 体験談を更新
    const updatedStory = await prisma.graduateStory.update({
      where: { id },
      data: {
        authorName: body.authorName,
        gender: body.gender || null,
        highSchoolLevel: body.highSchoolLevel,
        highSchoolName: body.highSchoolName || null,
        gradeAverage: body.gradeAverage,
        campus: body.campus || null,
        admissionType: body.admissionType,
        university: body.university,
        faculty: body.faculty,
        year: body.year ? parseInt(body.year) : null,
        researchTheme: body.researchTheme || null,
        researchMotivation: body.researchMotivation || null,
        researchDetails: body.researchDetails || null,
        targetProfessor: body.targetProfessor || null,
        hasSportsAchievement: body.hasSportsAchievement || false,
        sportsDetails: body.sportsDetails || null,
        sportsAchievements: body.sportsAchievements || [],
        hasEnglishQualification: body.hasEnglishQualification || false,
        englishQualification: body.englishQualification || null,
        hasStudyAbroad: body.hasStudyAbroad || false,
        studyAbroadDetails: body.studyAbroadDetails || null,
        hasLeaderExperience: body.hasLeaderExperience || false,
        leaderExperienceDetails: body.leaderExperienceDetails || null,
        hasContestAchievement: body.hasContestAchievement || false,
        contestAchievementDetails: body.contestAchievementDetails || null,
        interviewQuestions: body.interviewQuestions || null,
        selectionFlowType: body.selectionFlowType || null,
        firstRoundResult: body.firstRoundResult || null,
        secondRoundResult: body.secondRoundResult || null,
        documentPreparation: body.documentPreparation || null,
        secondRoundPreparation: body.secondRoundPreparation || null,
        materials: body.materials || null,
        adviceToJuniors: body.adviceToJuniors || null,
        explorationThemes: {
          deleteMany: {},
          create: explorationThemesData,
        },
        concurrentApplications: {
          deleteMany: {},
          create: concurrentApplicationsData,
        },
      },
      include: {
        author: {
          select: {
            id: true,
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
    })

    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json(
      { error: "体験談の更新に失敗しました" },
      { status: 500 }
    )
  }
}
