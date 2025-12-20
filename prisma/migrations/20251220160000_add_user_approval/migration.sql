-- AlterTable
ALTER TABLE "users" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;

-- 既存のユーザーは全て承認済みとする
UPDATE "users" SET "approved" = true;
