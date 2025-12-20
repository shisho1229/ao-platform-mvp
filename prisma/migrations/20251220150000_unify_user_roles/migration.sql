-- 既存のGRADUATEとSTUDENTユーザーをUSERに変換
UPDATE "users" SET role = 'USER' WHERE role IN ('GRADUATE', 'STUDENT');

-- UserRole enumを更新（古い値を削除、新しい値を追加）
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'USER');

-- usersテーブルのroleカラムを新しいenumに変換
ALTER TABLE "users"
  ALTER COLUMN role TYPE "UserRole"
  USING (CASE
    WHEN role::text = 'ADMIN' THEN 'ADMIN'::"UserRole"
    WHEN role::text = 'STAFF' THEN 'STAFF'::"UserRole"
    ELSE 'USER'::"UserRole"
  END);

-- 古いenumを削除
DROP TYPE "UserRole_old";
