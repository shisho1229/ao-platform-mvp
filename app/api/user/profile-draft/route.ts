import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// 共通プロフィール（複数出願用）の型
interface ProfileDraft {
  authorName: string
  gender: string
  highSchoolLevel: string
  highSchoolName: string
  gradeAverage: string
  campus: string
  // 実績
  hasSportsAchievement: boolean
  sportsDetails: string
  hasEnglishQualification: boolean
  englishQualification: string
  hasStudyAbroad: boolean
  studyAbroadDetails: string
  hasLeaderExperience: boolean
  leaderExperienceDetails: string
  hasContestAchievement: boolean
  contestAchievementDetails: string
}

// GET /api/user/profile-draft - 共通プロフィールを取得
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
    }

    // StoryDraftテーブルから取得（typeフィールドで区別）
    const draft = await prisma.storyDraft.findUnique({
      where: { userId: session.user.id },
    })

    if (!draft) {
      return NextResponse.json({ profile: null })
    }

    // JSON形式で保存されているデータをパース
    const data = JSON.parse(draft.data)

    // profileDraftフィールドがあればそれを返す
    if (data.profileDraft) {
      return NextResponse.json({ profile: data.profileDraft })
    }

    // 既存の下書きから共通フィールドを抽出
    const profile: ProfileDraft = {
      authorName: data.authorName || "",
      gender: data.gender || "",
      highSchoolLevel: data.highSchoolLevel || "LEVEL_2",
      highSchoolName: data.highSchoolName || "",
      gradeAverage: data.gradeAverage || "RANGE_3",
      campus: data.campus || "",
      hasSportsAchievement: data.hasSportsAchievement || false,
      sportsDetails: data.sportsDetails || "",
      hasEnglishQualification: data.hasEnglishQualification || false,
      englishQualification: data.englishQualification || "",
      hasStudyAbroad: data.hasStudyAbroad || false,
      studyAbroadDetails: data.studyAbroadDetails || "",
      hasLeaderExperience: data.hasLeaderExperience || false,
      leaderExperienceDetails: data.leaderExperienceDetails || "",
      hasContestAchievement: data.hasContestAchievement || false,
      contestAchievementDetails: data.contestAchievementDetails || "",
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("プロフィール取得エラー:", error)
    return NextResponse.json(
      { error: "プロフィールの取得に失敗しました" },
      { status: 500 }
    )
  }
}

// POST /api/user/profile-draft - 共通プロフィールを保存
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
    }

    const body = await request.json()
    const { profile } = body

    // 既存の下書きを取得
    const existingDraft = await prisma.storyDraft.findUnique({
      where: { userId: session.user.id },
    })

    let data: any = {}
    if (existingDraft) {
      data = JSON.parse(existingDraft.data)
    }

    // プロフィールを保存
    data.profileDraft = profile

    // upsert
    await prisma.storyDraft.upsert({
      where: { userId: session.user.id },
      update: { data: JSON.stringify(data) },
      create: {
        userId: session.user.id,
        data: JSON.stringify(data),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("プロフィール保存エラー:", error)
    return NextResponse.json(
      { error: "プロフィールの保存に失敗しました" },
      { status: 500 }
    )
  }
}
