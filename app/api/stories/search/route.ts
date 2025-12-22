import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface SearchCriteria {
  highSchoolLevel?: string
  gradeAverage?: string
  admissionType?: string
  university?: string
  faculty?: string
  explorationThemeIds?: number[]
  hasSportsAchievement?: boolean
  englishLevel?: string
  hasStudyAbroad?: boolean
  hasLeaderExperience?: boolean
}

interface StoryWithScore {
  story: any
  score: number
  matchPercentage: number
}

// スコアリングアルゴリズム
function calculateSimilarityScore(story: any, criteria: SearchCriteria): number {
  let score = 0

  // 高校偏差値帯一致 → +2
  if (criteria.highSchoolLevel && story.highSchoolLevel === criteria.highSchoolLevel) {
    score += 2
  }

  // 評定レンジ一致 → +2
  if (criteria.gradeAverage && story.gradeAverage === criteria.gradeAverage) {
    score += 2
  }

  // 入試方式一致 → +2
  if (criteria.admissionType && story.admissionType === criteria.admissionType) {
    score += 2
  }

  // 探究テーマ一致 → +2（最初の1つのみ）
  if (criteria.explorationThemeIds && criteria.explorationThemeIds.length > 0) {
    const storyThemeIds = story.explorationThemes.map((et: any) => et.themeId)
    const hasMatchingTheme = criteria.explorationThemeIds.some(id =>
      storyThemeIds.includes(id)
    )
    if (hasMatchingTheme) {
      score += 2
    }
  }

  // 英語資格レベル一致 → +1
  if (criteria.englishLevel && story.englishLevel === criteria.englishLevel) {
    score += 1
  }

  // 英語Lv3以上同士 → +1
  if (criteria.englishLevel &&
      (criteria.englishLevel === 'LV3' || criteria.englishLevel === 'LV4') &&
      (story.englishLevel === 'LV3' || story.englishLevel === 'LV4')) {
    score += 1
  }

  // 実績（スポーツ/リーダー）一致 → +1ずつ
  if (criteria.hasSportsAchievement && story.hasSportsAchievement) {
    score += 1
  }

  if (criteria.hasLeaderExperience && story.hasLeaderExperience) {
    score += 1
  }

  if (criteria.hasStudyAbroad && story.hasStudyAbroad) {
    score += 1
  }

  return score
}

// GET /api/stories/search - 類似合格者検索
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const criteria: SearchCriteria = {
      highSchoolLevel: searchParams.get("highSchoolLevel") || undefined,
      gradeAverage: searchParams.get("gradeAverage") || undefined,
      admissionType: searchParams.get("admissionType") || undefined,
      university: searchParams.get("university") || undefined,
      faculty: searchParams.get("faculty") || undefined,
      explorationThemeIds: searchParams.get("explorationThemeIds")
        ?.split(",")
        .map(Number)
        .filter(n => !isNaN(n)) || undefined,
      hasSportsAchievement: searchParams.get("hasSportsAchievement") === "true",
      englishLevel: searchParams.get("englishLevel") || undefined,
      hasStudyAbroad: searchParams.get("hasStudyAbroad") === "true",
      hasLeaderExperience: searchParams.get("hasLeaderExperience") === "true",
    }

    // 公開済みの体験記のみ取得（セキュリティ: 未公開記事の漏洩防止）
    const stories = await prisma.graduateStory.findMany({
      where: {
        published: true,
      },
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
    })

    // スコアリングして並び替え
    const storiesWithScores: StoryWithScore[] = stories.map(story => {
      const score = calculateSimilarityScore(story, criteria)
      const maxScore = 13 // 最大スコア
      const matchPercentage = Math.round((score / maxScore) * 100)

      return {
        story,
        score,
        matchPercentage,
      }
    })

    // スコアでソート（降順）
    storiesWithScores.sort((a, b) => b.score - a.score)

    return NextResponse.json(storiesWithScores)
  } catch (error) {
    console.error("Error searching stories:", error)
    return NextResponse.json(
      { error: "検索に失敗しました" },
      { status: 500 }
    )
  }
}
