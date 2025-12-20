-- 失敗したマイグレーションレコードを削除
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251220150000_unify_user_roles';
