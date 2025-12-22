// フォーム入力値の最大長制限
export const MAX_LENGTHS = {
  // 基本情報
  authorName: 50,
  highSchoolName: 100,
  university: 100,
  faculty: 100,
  admissionType: 100,

  // テキストエリア
  researchTheme: 500,
  researchMotivation: 2000,
  researchDetails: 5000,
  targetProfessor: 1000,

  // 実績
  sportsDetails: 500,
  englishQualification: 200,
  studyAbroadDetails: 1000,
  leaderExperienceDetails: 1000,
  contestAchievementDetails: 1000,

  // 選考情報
  interviewQuestions: 3000,

  // 対策
  documentPreparation: 3000,
  secondRoundPreparation: 3000,
  materials: 1000,

  // アドバイス
  adviceToJuniors: 3000,

  // その他
  reviewNotes: 2000,
  documentsUrl: 500,
} as const

// バリデーションヘルパー
export function validateLength(value: string | null | undefined, maxLength: number): boolean {
  if (!value) return true
  return value.length <= maxLength
}

export function truncateText(value: string | null | undefined, maxLength: number): string {
  if (!value) return ""
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength)
}

// バリデーションエラーメッセージ
export function getLengthErrorMessage(fieldName: string, maxLength: number): string {
  return `${fieldName}は${maxLength}文字以内で入力してください`
}
