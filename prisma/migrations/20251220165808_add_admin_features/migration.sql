-- AlterEnum
-- Add SUPER_ADMIN to UserRole enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'SUPER_ADMIN'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
    END IF;
END $$;

-- AlterTable
-- Add published field to graduate_stories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'published'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- AlterTable
-- Add documentsUrl field to graduate_stories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentsUrl'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "documentsUrl" TEXT;
    END IF;
END $$;
