-- ========================================
-- 必須フィールド追加マイグレーション（簡易版）
-- Neon Console SQL Editorでこのファイル全体を実行してください
-- ========================================

DO $$
BEGIN
    -- sportsDetails を追加（sportsAchievement から名前変更）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievement'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsDetails'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "sportsAchievement" TO "sportsDetails";
        RAISE NOTICE '✓ sportsAchievement を sportsDetails に名前変更しました';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "sportsDetails" TEXT;
        RAISE NOTICE '✓ sportsDetails を追加しました';
    END IF;

    -- sportsAchievements 配列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievements'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "sportsAchievements" TEXT[] DEFAULT '{}';
        RAISE NOTICE '✓ sportsAchievements を追加しました';
    END IF;

    -- researchTheme を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchTheme'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchTheme" TEXT;
        RAISE NOTICE '✓ researchTheme を追加しました';
    END IF;

    -- researchMotivation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchMotivation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchMotivation" TEXT;
        RAISE NOTICE '✓ researchMotivation を追加しました';
    END IF;

    -- researchDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchDetails" TEXT;
        RAISE NOTICE '✓ researchDetails を追加しました';
    END IF;

    -- targetProfessor を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'targetProfessor'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "targetProfessor" TEXT;
        RAISE NOTICE '✓ targetProfessor を追加しました';
    END IF;

    -- hasEnglishQualification を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasEnglishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasEnglishQualification" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE '✓ hasEnglishQualification を追加しました';
    END IF;

    -- englishQualification を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "englishQualification" TEXT;
        RAISE NOTICE '✓ englishQualification を追加しました';
    END IF;

    -- studyAbroadDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'studyAbroadDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "studyAbroadDetails" TEXT;
        RAISE NOTICE '✓ studyAbroadDetails を追加しました';
    END IF;

    -- leaderExperienceDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'leaderExperienceDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "leaderExperienceDetails" TEXT;
        RAISE NOTICE '✓ leaderExperienceDetails を追加しました';
    END IF;

    -- hasContestAchievement を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasContestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasContestAchievement" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE '✓ hasContestAchievement を追加しました';
    END IF;

    -- contestAchievementDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievementDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "contestAchievementDetails" TEXT;
        RAISE NOTICE '✓ contestAchievementDetails を追加しました';
    END IF;

    -- documentPreparation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "documentPreparation" TEXT;
        RAISE NOTICE '✓ documentPreparation を追加しました';
    END IF;

    -- secondRoundPreparation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'secondRoundPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "secondRoundPreparation" TEXT;
        RAISE NOTICE '✓ secondRoundPreparation を追加しました';
    END IF;

    -- authorName を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'authorName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "authorName" TEXT;
        RAISE NOTICE '✓ authorName を追加しました';
    END IF;

    -- highSchoolName を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'highSchoolName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "highSchoolName" TEXT;
        RAISE NOTICE '✓ highSchoolName を追加しました';
    END IF;

    -- campus を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'campus'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "campus" TEXT;
        RAISE NOTICE '✓ campus を追加しました';
    END IF;

    -- year を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'year'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "year" INTEGER;
        RAISE NOTICE '✓ year を追加しました';
    END IF;

    -- firstRoundResult を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'firstRoundResult'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "firstRoundResult" TEXT;
        RAISE NOTICE '✓ firstRoundResult を追加しました';
    END IF;

    -- secondRoundResult を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'secondRoundResult'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "secondRoundResult" TEXT;
        RAISE NOTICE '✓ secondRoundResult を追加しました';
    END IF;

    -- selectionFlowType を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'selectionFlowType'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "selectionFlowType" TEXT;
        RAISE NOTICE '✓ selectionFlowType を追加しました';
    END IF;

    -- StoryStatus enum を追加
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoryStatus') THEN
        CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'NEEDS_REVISION', 'PUBLISHED');
        RAISE NOTICE '✓ StoryStatus enum を追加しました';
    END IF;

    -- status を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'status'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW';
        UPDATE "graduate_stories" SET "status" = 'PUBLISHED' WHERE "published" = true;
        RAISE NOTICE '✓ status を追加しました';
    END IF;

    -- reviewNotes を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'reviewNotes'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "reviewNotes" TEXT;
        RAISE NOTICE '✓ reviewNotes を追加しました';
    END IF;

    -- favorites テーブルを作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        CREATE TABLE "favorites" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "storyId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
        );
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_storyId_key" UNIQUE ("userId", "storyId");
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_storyId_fkey"
            FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE '✓ favorites テーブルを作成しました';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ マイグレーション完了！ ✓✓✓';
    RAISE NOTICE '========================================';
END $$;
