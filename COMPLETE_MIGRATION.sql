-- ========================================
-- 完全マイグレーションSQL（初期化から最新まで）
-- Neon Console SQL Editorでこのファイル全体を実行してください
-- ========================================

-- ============================================
-- STEP 1: ENUMの作成
-- ============================================

DO $$
BEGIN
    -- UserRole enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'USER');
        RAISE NOTICE '✓ UserRole enum を作成しました';
    END IF;

    -- Gender enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
        RAISE NOTICE '✓ Gender enum を作成しました';
    END IF;

    -- HighSchoolLevel enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HighSchoolLevel') THEN
        CREATE TYPE "HighSchoolLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');
        RAISE NOTICE '✓ HighSchoolLevel enum を作成しました';
    END IF;

    -- GradeAverage enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GradeAverage') THEN
        CREATE TYPE "GradeAverage" AS ENUM ('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5');
        RAISE NOTICE '✓ GradeAverage enum を作成しました';
    END IF;

    -- ApplicationResult enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationResult') THEN
        CREATE TYPE "ApplicationResult" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');
        RAISE NOTICE '✓ ApplicationResult enum を作成しました';
    END IF;

    -- StoryStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoryStatus') THEN
        CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'NEEDS_REVISION', 'PUBLISHED');
        RAISE NOTICE '✓ StoryStatus enum を作成しました';
    END IF;
END $$;

-- ============================================
-- STEP 2: テーブルの作成
-- ============================================

-- users テーブル
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "campus" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- exploration_themes テーブル
CREATE TABLE IF NOT EXISTS "exploration_themes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "exploration_themes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "exploration_themes_name_key" ON "exploration_themes"("name");

-- graduate_stories テーブル（最新スキーマ）
CREATE TABLE IF NOT EXISTS "graduate_stories" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT,

    -- 基礎属性
    "gender" "Gender",
    "highSchoolLevel" "HighSchoolLevel" NOT NULL,
    "highSchoolName" TEXT,
    "gradeAverage" "GradeAverage" NOT NULL,
    "campus" TEXT,
    "admissionType" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "year" INTEGER,

    -- 探究・活動
    "researchTheme" TEXT,
    "researchMotivation" TEXT,
    "researchDetails" TEXT,
    "targetProfessor" TEXT,

    -- 実績
    "hasSportsAchievement" BOOLEAN NOT NULL DEFAULT false,
    "sportsDetails" TEXT,
    "sportsAchievements" TEXT[] DEFAULT '{}',
    "hasEnglishQualification" BOOLEAN NOT NULL DEFAULT false,
    "englishQualification" TEXT,
    "hasStudyAbroad" BOOLEAN NOT NULL DEFAULT false,
    "studyAbroadDetails" TEXT,
    "hasLeaderExperience" BOOLEAN NOT NULL DEFAULT false,
    "leaderExperienceDetails" TEXT,
    "hasContestAchievement" BOOLEAN NOT NULL DEFAULT false,
    "contestAchievementDetails" TEXT,

    -- 選考情報
    "interviewQuestions" TEXT,
    "firstRoundResult" TEXT,
    "secondRoundResult" TEXT,
    "selectionFlowType" TEXT,

    -- 対策
    "documentPreparation" TEXT,
    "secondRoundPreparation" TEXT,
    "materials" TEXT,

    -- その他
    "adviceToJuniors" TEXT,

    -- 管理
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNotes" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "documentsUrl" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduate_stories_pkey" PRIMARY KEY ("id")
);

-- story_exploration_themes テーブル
CREATE TABLE IF NOT EXISTS "story_exploration_themes" (
    "storyId" TEXT NOT NULL,
    "themeId" INTEGER NOT NULL,
    CONSTRAINT "story_exploration_themes_pkey" PRIMARY KEY ("storyId","themeId")
);

-- concurrent_applications テーブル
CREATE TABLE IF NOT EXISTS "concurrent_applications" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "result" "ApplicationResult" NOT NULL,
    CONSTRAINT "concurrent_applications_pkey" PRIMARY KEY ("id")
);

-- favorites テーブル
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "favorites_userId_storyId_key" ON "favorites"("userId", "storyId");

-- ============================================
-- STEP 3: 外部キー制約の追加
-- ============================================

DO $$
BEGIN
    -- graduate_stories -> users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'graduate_stories_authorId_fkey'
    ) THEN
        ALTER TABLE "graduate_stories"
        ADD CONSTRAINT "graduate_stories_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE '✓ graduate_stories -> users 外部キーを追加しました';
    END IF;

    -- story_exploration_themes -> graduate_stories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'story_exploration_themes_storyId_fkey'
    ) THEN
        ALTER TABLE "story_exploration_themes"
        ADD CONSTRAINT "story_exploration_themes_storyId_fkey"
        FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE '✓ story_exploration_themes -> graduate_stories 外部キーを追加しました';
    END IF;

    -- story_exploration_themes -> exploration_themes
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'story_exploration_themes_themeId_fkey'
    ) THEN
        ALTER TABLE "story_exploration_themes"
        ADD CONSTRAINT "story_exploration_themes_themeId_fkey"
        FOREIGN KEY ("themeId") REFERENCES "exploration_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE '✓ story_exploration_themes -> exploration_themes 外部キーを追加しました';
    END IF;

    -- concurrent_applications -> graduate_stories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'concurrent_applications_storyId_fkey'
    ) THEN
        ALTER TABLE "concurrent_applications"
        ADD CONSTRAINT "concurrent_applications_storyId_fkey"
        FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE '✓ concurrent_applications -> graduate_stories 外部キーを追加しました';
    END IF;

    -- favorites -> users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_userId_fkey'
    ) THEN
        ALTER TABLE "favorites"
        ADD CONSTRAINT "favorites_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE '✓ favorites -> users 外部キーを追加しました';
    END IF;

    -- favorites -> graduate_stories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_storyId_fkey'
    ) THEN
        ALTER TABLE "favorites"
        ADD CONSTRAINT "favorites_storyId_fkey"
        FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE '✓ favorites -> graduate_stories 外部キーを追加しました';
    END IF;
END $$;

-- ============================================
-- STEP 4: 完了メッセージ
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ 完全マイグレーション完了！ ✓✓✓';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'すべてのテーブルとフィールドが作成されました。';
    RAISE NOTICE 'アプリケーションが正常に動作します。';
END $$;
