-- 新しいUserRole enumを作成
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STAFF', 'USER');

-- usersテーブルのroleカラムを新しいenumに変換（GRADUATE/STUDENTをUSERにマッピング）
ALTER TABLE "users"
  ALTER COLUMN role TYPE "UserRole_new"
  USING (CASE
    WHEN role::text = 'ADMIN' THEN 'ADMIN'::"UserRole_new"
    WHEN role::text = 'STAFF' THEN 'STAFF'::"UserRole_new"
    ELSE 'USER'::"UserRole_new"
  END);

-- 古いenumを削除
DROP TYPE "UserRole";

-- 新しいenumを正しい名前にリネーム
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
