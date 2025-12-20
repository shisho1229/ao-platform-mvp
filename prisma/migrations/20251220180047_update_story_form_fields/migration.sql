-- フォーム改善のためのフィールド更新マイグレーション

DO $$
BEGIN
    -- activityContent列を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'activityContent'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "activityContent";
    END IF;

    -- researchMethodをresearchDetailsに名前変更
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'researchMethod'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "researchMethod" TO "researchDetails";
    END IF;

    -- englishLevel列を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishLevel'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "englishLevel";
    END IF;

    -- sportsAchievementをsportsDetailsに名前変更
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "sportsAchievement" TO "sportsDetails";
    END IF;

    -- sportsAchievements列を追加（文字列配列）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'sportsAchievements'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "sportsAchievements" TEXT[] DEFAULT '{}';
    END IF;

    -- hasEnglishQualification列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasEnglishQualification'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasEnglishQualification" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- englishDetailをenglishQualificationに名前変更
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'englishDetail'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "englishDetail" TO "englishQualification";
    END IF;

    -- studyAbroadDetails列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'studyAbroadDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "studyAbroadDetails" TEXT;
    END IF;

    -- leaderExperienceをleaderExperienceDetailsに名前変更
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'leaderExperience'
    ) THEN
        ALTER TABLE "graduate_stories" RENAME COLUMN "leaderExperience" TO "leaderExperienceDetails";
    END IF;

    -- contestAchievement列を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "contestAchievement";
    END IF;

    -- hasContestAchievement列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'hasContestAchievement'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "hasContestAchievement" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- contestAchievementDetails列を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'contestAchievementDetails'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "contestAchievementDetails" TEXT;
    END IF;
END $$;

-- EnglishLevel enumを削除
DROP TYPE IF EXISTS "EnglishLevel";
