-- AlterTable: 匿名表示フラグを追加
ALTER TABLE "graduate_stories" ADD COLUMN "isAnonymous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: 高校名を必須に変更（既存のNULLデータには空文字列を設定）
UPDATE "graduate_stories" SET "highSchoolName" = '' WHERE "highSchoolName" IS NULL;
ALTER TABLE "graduate_stories" ALTER COLUMN "highSchoolName" SET NOT NULL;

-- AlterTable: 面接質問をテキストから配列に変更
-- まず既存データを配列形式に変換（NULLまたは空の場合は空配列、それ以外は1要素の配列に）
ALTER TABLE "graduate_stories" ADD COLUMN "interviewQuestions_new" TEXT[];
UPDATE "graduate_stories" SET "interviewQuestions_new" =
  CASE
    WHEN "interviewQuestions" IS NULL OR "interviewQuestions" = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY["interviewQuestions"]::TEXT[]
  END;
ALTER TABLE "graduate_stories" DROP COLUMN "interviewQuestions";
ALTER TABLE "graduate_stories" RENAME COLUMN "interviewQuestions_new" TO "interviewQuestions";
ALTER TABLE "graduate_stories" ALTER COLUMN "interviewQuestions" SET NOT NULL;
ALTER TABLE "graduate_stories" ALTER COLUMN "interviewQuestions" SET DEFAULT ARRAY[]::TEXT[];
