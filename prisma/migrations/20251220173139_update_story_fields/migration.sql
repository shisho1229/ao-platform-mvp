-- AlterTable graduate_stories
-- 新しいフィールドを追加

DO $$
BEGIN
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

    -- researchMethod を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchMethod'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "researchMethod" TEXT;
    END IF;

    -- targetProfessor を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'targetProfessor'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "targetProfessor" TEXT;
    END IF;

    -- contestAchievement を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "contestAchievement" TEXT;
    END IF;

    -- activityResults を削除（データが存在する可能性があるため、存在チェック）
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
END $$;
