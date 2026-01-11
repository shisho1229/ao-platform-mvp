-- interviewQuestionsカラムの型をTEXT[]からTEXTに変更
-- 既存の配列データを文字列に変換

ALTER TABLE "graduate_stories"
ALTER COLUMN "interviewQuestions" TYPE TEXT
USING CASE
  WHEN "interviewQuestions" IS NULL THEN NULL
  ELSE array_to_string("interviewQuestions", E'\n')
END;
