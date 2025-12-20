-- AlterTable
-- Add highSchoolName field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'highSchoolName'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "highSchoolName" TEXT;
    END IF;
END $$;
