-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'GRADUATE', 'STUDENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "HighSchoolLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');

-- CreateEnum
CREATE TYPE "GradeAverage" AS ENUM ('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5');

-- CreateEnum
CREATE TYPE "EnglishLevel" AS ENUM ('LV0', 'LV1', 'LV2', 'LV3', 'LV4');

-- CreateEnum
CREATE TYPE "ApplicationResult" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduate_stories" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "gender" "Gender",
    "highSchoolLevel" "HighSchoolLevel" NOT NULL,
    "gradeAverage" "GradeAverage" NOT NULL,
    "admissionType" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "activityContent" TEXT,
    "activityResults" TEXT,
    "hasSportsAchievement" BOOLEAN NOT NULL DEFAULT false,
    "sportsAchievement" TEXT,
    "englishLevel" "EnglishLevel" NOT NULL,
    "englishDetail" TEXT,
    "hasStudyAbroad" BOOLEAN NOT NULL DEFAULT false,
    "hasLeaderExperience" BOOLEAN NOT NULL DEFAULT false,
    "leaderExperience" TEXT,
    "interviewQuestions" TEXT,
    "documentThemes" TEXT,
    "preparationMethod" TEXT,
    "materials" TEXT,
    "adviceToJuniors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduate_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploration_themes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "exploration_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_exploration_themes" (
    "storyId" TEXT NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "story_exploration_themes_pkey" PRIMARY KEY ("storyId","themeId")
);

-- CreateTable
CREATE TABLE "concurrent_applications" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "result" "ApplicationResult" NOT NULL,

    CONSTRAINT "concurrent_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_documents" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exploration_themes_name_key" ON "exploration_themes"("name");

-- AddForeignKey
ALTER TABLE "graduate_stories" ADD CONSTRAINT "graduate_stories_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_exploration_themes" ADD CONSTRAINT "story_exploration_themes_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_exploration_themes" ADD CONSTRAINT "story_exploration_themes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "exploration_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concurrent_applications" ADD CONSTRAINT "concurrent_applications_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_documents" ADD CONSTRAINT "admission_documents_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_documents" ADD CONSTRAINT "admission_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

