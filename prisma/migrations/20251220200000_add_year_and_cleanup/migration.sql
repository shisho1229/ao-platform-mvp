-- AlterTable
-- Add year field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'year'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "year" INTEGER;
    END IF;
END $$;
