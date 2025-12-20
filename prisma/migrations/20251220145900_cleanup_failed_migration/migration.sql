-- 失敗したマイグレーションをロールバック済みとしてマーク
UPDATE "_prisma_migrations"
SET rolled_back_at = NOW(),
    finished_at = NOW()
WHERE migration_name = '20251220150000_unify_user_roles'
  AND rolled_back_at IS NULL;
