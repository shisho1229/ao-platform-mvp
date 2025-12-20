-- 対策方法を書類対策と二次対策に分割

DO $$
BEGIN
    -- documentPreparation列を追加（書類対策）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'documentPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "documentPreparation" TEXT;
    END IF;

    -- secondRoundPreparation列を追加（二次対策）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'secondRoundPreparation'
    ) THEN
        ALTER TABLE "graduate_stories" ADD COLUMN "secondRoundPreparation" TEXT;
    END IF;

    -- 既存のpreparationMethodデータをdocumentPreparationにコピー（データが存在する場合）
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'preparationMethod'
    ) THEN
        UPDATE "graduate_stories"
        SET "documentPreparation" = "preparationMethod"
        WHERE "preparationMethod" IS NOT NULL AND "documentPreparation" IS NULL;
    END IF;

    -- preparationMethod列を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'graduate_stories' AND column_name = 'preparationMethod'
    ) THEN
        ALTER TABLE "graduate_stories" DROP COLUMN "preparationMethod";
    END IF;
END $$;
