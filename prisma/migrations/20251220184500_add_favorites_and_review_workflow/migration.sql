-- お気に入り機能と承認フローの追加

-- StoryStatus enumを作成
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'NEEDS_REVISION', 'PUBLISHED');

DO $$
BEGIN
    -- authorName列を追加（投稿者名）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'authorName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "authorName" TEXT;
    END IF;

    -- status列を追加（承認ステータス）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'status'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW';
    END IF;

    -- reviewNotes列を追加（スタッフからの修正依頼メモ）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'reviewNotes'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "reviewNotes" TEXT;
    END IF;

    -- publishedのデフォルト値をfalseに変更（既存レコードは変更しない）
    ALTER TABLE "graduate_stories" ALTER COLUMN "published" SET DEFAULT false;

    -- 既存の公開済みレコードのstatusをPUBLISHEDに更新
    UPDATE "graduate_stories" SET "status" = 'PUBLISHED' WHERE "published" = true;
END $$;

-- お気に入りテーブルを作成
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- ユニーク制約を追加（同じユーザーが同じ体験記を複数回お気に入りできないようにする）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_userId_storyId_key'
    ) THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_storyId_key" UNIQUE ("userId", "storyId");
    END IF;
END $$;

-- 外部キー制約を追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_userId_fkey'
    ) THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_storyId_fkey'
    ) THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "graduate_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS "favorites_userId_idx" ON "favorites"("userId");
CREATE INDEX IF NOT EXISTS "favorites_storyId_idx" ON "favorites"("storyId");
