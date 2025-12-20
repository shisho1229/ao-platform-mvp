-- DropTable: Remove admission_documents table
DROP TABLE IF EXISTS "admission_documents";

-- AlterTable: Remove aspiration statement and agreement fields from graduate_stories
ALTER TABLE "graduate_stories" DROP COLUMN IF EXISTS "aspirationStatement";
ALTER TABLE "graduate_stories" DROP COLUMN IF EXISTS "agreedToTerms";
