"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Story {
  id: string
  university: string
  faculty: string
  highSchoolLevel: string
  gradeAverage: string
  admissionType: string
  englishLevel: string
  hasStudyAbroad: boolean
  hasSportsAchievement: boolean
  hasLeaderExperience: boolean
  explorationThemes: Array<{
    theme: {
      id: number
      name: string
    }
  }>
  createdAt: string
}

export default function StoriesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories")
      if (res.ok) {
        const data = await res.json()
        setStories(data)
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const highSchoolLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      LEVEL_1: "~50",
      LEVEL_2: "51-60",
      LEVEL_3: "61-70",
      LEVEL_4: "71~",
    }
    return labels[level] || level
  }

  const gradeAverageLabel = (grade: string) => {
    const labels: Record<string, string> = {
      RANGE_1: "~3.0",
      RANGE_2: "3.1-3.5",
      RANGE_3: "3.6-4.0",
      RANGE_4: "4.1-4.5",
      RANGE_5: "4.6~",
    }
    return labels[grade] || grade
  }

  const englishLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      LV0: "なし",
      LV1: "基礎",
      LV2: "標準",
      LV3: "上位",
      LV4: "最上位",
    }
    return labels[level] || level
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">合格体験談</h1>
          {session?.user?.role === "GRADUATE" && (
            <Link
              href="/stories/new"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              体験談を投稿
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              まだ体験談が投稿されていません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {story.university}
                  </h2>
                  <p className="text-gray-600">{story.faculty}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>入試方式:</span>
                    <span className="font-medium">{story.admissionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>高校偏差値:</span>
                    <span className="font-medium">
                      {highSchoolLevelLabel(story.highSchoolLevel)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>評定平均:</span>
                    <span className="font-medium">
                      {gradeAverageLabel(story.gradeAverage)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>英語レベル:</span>
                    <span className="font-medium">
                      {englishLevelLabel(story.englishLevel)}
                    </span>
                  </div>
                </div>

                {story.explorationThemes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {story.explorationThemes.slice(0, 3).map((et) => (
                      <span
                        key={et.theme.id}
                        className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded"
                      >
                        {et.theme.name}
                      </span>
                    ))}
                    {story.explorationThemes.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600">
                        +{story.explorationThemes.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2 text-xs text-gray-500">
                  {story.hasSportsAchievement && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      スポーツ
                    </span>
                  )}
                  {story.hasStudyAbroad && (
                    <span className="px-2 py-1 bg-gray-100 rounded">留学</span>
                  )}
                  {story.hasLeaderExperience && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      リーダー
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
