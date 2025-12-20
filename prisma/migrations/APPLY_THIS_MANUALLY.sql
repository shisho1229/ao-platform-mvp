-- ========================================
-- 統合マイグレーションSQL
-- このファイルをデータベースに手動で適用してください
-- ========================================
--
-- 適用方法:
-- 1. Neon Console (https://console.neon.tech/) にログイン
-- 2. プロジェクトを選択
-- 3. SQL Editor を開く
-- 4. このファイルの内容をコピー＆ペーストして実行
--
-- ========================================

-- すべての必要なフィールドを追加（IF NOT EXISTSで安全に実行）
DO $$
BEGIN
    -- ============================================
    -- 探究・活動関連フィールド
    -- ============================================

    -- researchTheme を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchTheme'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchTheme" TEXT;
    END IF;

    -- researchMotivation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchMotivation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchMotivation" TEXT;
    END IF;

    -- researchDetails を追加（または researchMethod から名前変更）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchMethod'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchDetails'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "researchMethod" TO "researchDetails";
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchDetails" TEXT;
    END IF;

    -- targetProfessor を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'targetProfessor'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "targetProfessor" TEXT;
    END IF;

    -- ============================================
    -- 実績関連フィールド
    -- ============================================

    -- sportsDetails を追加（または sportsAchievement から名前変更）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievement'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsDetails'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "sportsAchievement" TO "sportsDetails";
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "sportsDetails" TEXT;
    END IF;

    -- sportsAchievements 配列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievements'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "sportsAchievements" TEXT[] DEFAULT '{}';
    END IF;

    -- hasEnglishQualification を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasEnglishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasEnglishQualification" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- englishQualification を追加（または englishDetail から名前変更）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishDetail'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "englishDetail" TO "englishQualification";
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "englishQualification" TEXT;
    END IF;

    -- studyAbroadDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'studyAbroadDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "studyAbroadDetails" TEXT;
    END IF;

    -- leaderExperienceDetails を追加（または leaderExperience から名前変更）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'leaderExperience'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'leaderExperienceDetails'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "leaderExperience" TO "leaderExperienceDetails";
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'leaderExperienceDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "leaderExperienceDetails" TEXT;
    END IF;

    -- hasContestAchievement を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasContestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasContestAchievement" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- contestAchievementDetails を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievementDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "contestAchievementDetails" TEXT;
    END IF;

    -- ============================================
    -- 対策関連フィールド
    -- ============================================

    -- documentPreparation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "documentPreparation" TEXT;
    END IF;

    -- secondRoundPreparation を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'secondRoundPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "secondRoundPreparation" TEXT;
    END IF;

    -- ============================================
    -- 基礎情報フィールド
    -- ============================================

    -- authorName を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'authorName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "authorName" TEXT;
    END IF;

    -- highSchoolName を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'highSchoolName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "highSchoolName" TEXT;
    END IF;

    -- campus を追加（体験談テーブル）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'campus'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "campus" TEXT;
    END IF;

    -- year を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'year'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "year" INTEGER;
    END IF;

    -- ============================================
    -- 選考情報フィールド
    -- ============================================

    -- firstRoundResult を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'firstRoundResult'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "firstRoundResult" TEXT;
    END IF;

    -- secondRoundResult を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'secondRoundResult'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "secondRoundResult" TEXT;
    END IF;

    -- selectionFlowType を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'selectionFlowType'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "selectionFlowType" TEXT;
    END IF;

    -- ============================================
    -- 承認ワークフロー関連
    -- ============================================

    -- StoryStatus enum を追加
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoryStatus') THEN
        CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'NEEDS_REVISION', 'PUBLISHED');
    END IF;

    -- status を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'status'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW';
        -- 既存のpublished=trueのレコードはPUBLISHEDに設定
        UPDATE "graduate_stories" SET "status" = 'PUBLISHED' WHERE "published" = true;
    END IF;

    -- reviewNotes を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'reviewNotes'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "reviewNotes" TEXT;
    END IF;

    -- ============================================
    -- お気に入り機能
    -- ============================================

    -- favorites テーブルを作成
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        CREATE TABLE "favorites" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "storyId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
        );

        -- ユニーク制約を追加
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_storyId_key" UNIQUE ("userId", "storyId");

        -- 外部キー制約を追加
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_storyId_fkey"
            FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- ============================================
    -- 不要なフィールドを削除（存在する場合のみ）
    -- ============================================

    -- activityContent を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'activityContent'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "activityContent";
    END IF;

    -- activityResults を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'activityResults'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "activityResults";
    END IF;

    -- documentThemes を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentThemes'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "documentThemes";
    END IF;

    -- contestAchievement を削除（新しく hasContestAchievement と contestAchievementDetails を使用）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievement'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasContestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "contestAchievement";
    END IF;

    -- englishLevel を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishLevel'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "englishLevel";
    END IF;

    -- preparationMethod を削除（documentPreparation と secondRoundPreparation に分割）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'preparationMethod'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "preparationMethod";
    END IF;

END $$;

-- EnglishLevel enum を削除（存在する場合のみ）
DROP TYPE IF EXISTS "EnglishLevel";

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '✓ マイグレーション適用完了！';
    RAISE NOTICE '✓ すべての必要なフィールドがデータベースに追加されました。';
END $$;
