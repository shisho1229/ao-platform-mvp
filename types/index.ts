import { Prisma } from "@prisma/client"

// ストーリー関連の型
export interface ExplorationTheme {
  id: number
  name: string
  description: string
}

export interface ExplorationThemeRelation {
  themeId: number
  theme: ExplorationTheme
}

export interface ConcurrentApplication {
  id: string
  university: string
  faculty: string
  result: string
}

export interface StoryAuthor {
  id: string
  name: string | null
  email?: string
  campus: string | null
}

export interface Story {
  id: string
  university: string
  faculty: string
  authorId: string
  authorName?: string | null
  gender: string | null
  highSchoolLevel: string
  highSchoolName?: string | null
  gradeAverage: string
  campus?: string | null
  admissionType: string
  year?: number | null
  documentsUrl?: string | null
  published: boolean
  status: string
  researchTheme?: string | null
  researchMotivation?: string | null
  researchDetails?: string | null
  targetProfessor?: string | null
  hasSportsAchievement: boolean
  sportsDetails?: string | null
  sportsAchievements?: string[]
  hasEnglishQualification: boolean
  englishQualification?: string | null
  hasStudyAbroad: boolean
  studyAbroadDetails?: string | null
  hasLeaderExperience: boolean
  leaderExperienceDetails?: string | null
  hasContestAchievement: boolean
  contestAchievementDetails?: string | null
  firstRoundResult?: string | null
  secondRoundResult?: string | null
  interviewQuestions?: string | null
  documentPreparation?: string | null
  secondRoundPreparation?: string | null
  materials?: string | null
  adviceToJuniors?: string | null
  reviewNotes?: string | null
  createdAt: Date | string
  updatedAt?: Date | string
  author?: StoryAuthor
  explorationThemes: ExplorationThemeRelation[]
  concurrentApplications: ConcurrentApplication[]
  favorites?: { id: string }[]
}

// お気に入り関連
export interface Favorite {
  id: string
  storyId: string
  userId: string
  createdAt: Date | string
  story?: Story
}

// ユーザー関連
export interface User {
  id: string
  email: string
  name: string | null
  campus?: string | null
  role: string
  approved: boolean
  createdAt: Date | string
}

// 検索関連
export interface SearchCriteria {
  university: string
  faculty: string
  admissionType: string
  gradeAverage: string
  highSchoolLevel: string
  englishQualification: string
  explorationThemes: number[]
}

export interface SearchResult {
  story: Story
  score: number
}

// API レスポンス関連
export interface ApiError {
  error: string
  details?: string
}

// Prisma where 条件の型
export type StoryWhereInput = Prisma.GraduateStoryWhereInput
export type UserWhereInput = Prisma.UserWhereInput
export type StoryOrderByInput = Prisma.GraduateStoryOrderByWithRelationInput
