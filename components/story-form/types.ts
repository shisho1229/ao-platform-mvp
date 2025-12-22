// フォームデータの型定義
export interface StoryFormData {
  authorName: string
  gender: string
  highSchoolLevel: string
  highSchoolName: string
  gradeAverage: string
  campus: string
  admissionType: string
  university: string
  faculty: string
  year: string
  explorationThemeIds: number[]
  researchTheme: string
  researchMotivation: string
  researchDetails: string
  targetProfessor: string
  hasSportsAchievement: boolean
  sportsDetails: string
  sportsAchievements: string[]
  hasEnglishQualification: boolean
  englishQualification: string
  hasStudyAbroad: boolean
  studyAbroadDetails: string
  hasLeaderExperience: boolean
  leaderExperienceDetails: string
  hasContestAchievement: boolean
  contestAchievementDetails: string
  interviewQuestions: string
  selectionFlowType: string
  firstRoundResult: string
  secondRoundResult: string
  documentPreparation: string
  secondRoundPreparation: string
  materials: string
  adviceToJuniors: string
}

export interface ConcurrentApplication {
  university: string
  faculty: string
  result: string
}

export interface ExplorationTheme {
  id: number
  name: string
  description: string
}

// 初期フォームデータ
export const initialFormData: StoryFormData = {
  authorName: "",
  gender: "",
  highSchoolLevel: "LEVEL_2",
  highSchoolName: "",
  gradeAverage: "RANGE_3",
  campus: "",
  admissionType: "",
  university: "",
  faculty: "",
  year: "",
  explorationThemeIds: [],
  researchTheme: "",
  researchMotivation: "",
  researchDetails: "",
  targetProfessor: "",
  hasSportsAchievement: false,
  sportsDetails: "",
  sportsAchievements: [],
  hasEnglishQualification: false,
  englishQualification: "",
  hasStudyAbroad: false,
  studyAbroadDetails: "",
  hasLeaderExperience: false,
  leaderExperienceDetails: "",
  hasContestAchievement: false,
  contestAchievementDetails: "",
  interviewQuestions: "",
  selectionFlowType: "",
  firstRoundResult: "",
  secondRoundResult: "",
  documentPreparation: "",
  secondRoundPreparation: "",
  materials: "",
  adviceToJuniors: "",
}

// ラベル定義
export const labels = {
  universities: [
    "慶應義塾大学",
    "早稲田大学",
    "上智大学",
    "青山学院大学",
    "明治大学",
    "立教大学",
    "中央大学",
    "学習院大学",
  ],
  campuses: [
    "武蔵小杉",
    "下北沢",
    "自由が丘",
    "渋谷",
    "オンライン",
    "青葉台",
  ],
  genders: [
    { value: "MALE", label: "男性" },
    { value: "FEMALE", label: "女性" },
    { value: "OTHER", label: "その他" },
    { value: "PREFER_NOT_TO_SAY", label: "回答しない" },
  ],
  highSchoolLevels: [
    { value: "LEVEL_1", label: "~50" },
    { value: "LEVEL_2", label: "51-60" },
    { value: "LEVEL_3", label: "61-70" },
    { value: "LEVEL_4", label: "71~" },
  ],
  gradeAverages: [
    { value: "RANGE_1", label: "~3.0" },
    { value: "RANGE_2", label: "3.1-3.5" },
    { value: "RANGE_3", label: "3.6-4.0" },
    { value: "RANGE_4", label: "4.1-4.5" },
    { value: "RANGE_5", label: "4.6~" },
  ],
  sportsAchievements: [
    "全国大会出場",
    "地方大会優勝",
    "県大会優勝",
    "県大会上位入賞",
    "その他の実績",
  ],
  applicationResults: [
    { value: "ACCEPTED", label: "合格" },
    { value: "REJECTED", label: "不合格" },
    { value: "PENDING", label: "結果待ち" },
  ],
}
