import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/stories/[id] - 体験談編集
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params
    const body = await request.json()

    const {
      gender,
      highSchoolLevel,
      highSchoolName,
      gradeAverage,
      admissionType,
      university,
      faculty,
      year,
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
    } = body

    // 体験談を更新
    const story = await prisma.graduateStory.update({
      where: { id: storyId },
      data: {
        gender: gender || null,
        highSchoolLevel,
        highSchoolName: highSchoolName || null,
        gradeAverage,
        admissionType,
        university,
        faculty,
        year: year || null,
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
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json(story)
  } catch (error: any) {
    console.error("Error updating story:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "体験談の更新に失敗しました" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/stories/[id] - 体験談削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"])
    const { id: storyId } = await params

    // 体験談を削除
    await prisma.graduateStory.delete({
      where: { id: storyId },
    })

    return NextResponse.json({ message: "体験談を削除しました" })
  } catch (error: any) {
    console.error("Error deleting story:", error)

    if (error.message === "権限がありません") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "体験談が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "体験談の削除に失敗しました" },
      { status: 500 }
    )
  }
}
