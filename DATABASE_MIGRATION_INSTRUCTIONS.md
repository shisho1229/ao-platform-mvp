# データベースマイグレーション適用手順

体験記の投稿エラーを解決するために、データベースに最新のスキーマを適用する必要があります。

## エラーの原因

データベースに必要なカラム（`sportsDetails`など）が存在していないため、体験記の投稿に失敗しています。

## 解決方法

以下の手順でマイグレーションSQLをデータベースに適用してください。

### ステップ1: Neon Consoleにログイン

1. [Neon Console](https://console.neon.tech/) にアクセス
2. ログイン
3. プロジェクトを選択

### ステップ2: SQL Editorを開く

1. 左サイドバーから「SQL Editor」を選択
2. または、プロジェクトダッシュボードの「Query」ボタンをクリック

### ステップ3: マイグレーションSQLを実行

1. `prisma/migrations/APPLY_THIS_MANUALLY.sql` ファイルを開く
2. ファイルの内容を**すべてコピー**
3. SQL Editorに**ペースト**
4. 「Run」ボタンをクリックして実行

### ステップ4: 実行結果を確認

以下のようなメッセージが表示されれば成功です：

```
NOTICE: ✓ マイグレーション適用完了！
NOTICE: ✓ すべての必要なフィールドがデータベースに追加されました。
```

### ステップ5: アプリケーションを再起動

マイグレーション適用後、アプリケーションを再起動してください：

```bash
# 開発サーバーを再起動
npm run dev
```

## トラブルシューティング

### エラーが発生した場合

1. エラーメッセージを確認
2. すでに適用されているマイグレーションがある場合、一部のステップがスキップされる可能性があります（これは正常です）
3. それでも解決しない場合は、エラーメッセージをコピーして報告してください

### マイグレーションが適用されたか確認する方法

SQL Editorで以下のクエリを実行：

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'graduate_stories'
ORDER BY column_name;
```

以下のカラムが存在することを確認：
- `sportsDetails` (text)
- `sportsAchievements` (ARRAY)
- `researchTheme` (text)
- `researchMotivation` (text)
- `researchDetails` (text)
- `targetProfessor` (text)
- `hasEnglishQualification` (boolean)
- `englishQualification` (text)
- `studyAbroadDetails` (text)
- `hasContestAchievement` (boolean)
- `contestAchievementDetails` (text)
- `leaderExperienceDetails` (text)
- `documentPreparation` (text)
- `secondRoundPreparation` (text)
- `authorName` (text)
- `highSchoolName` (text)
- `campus` (text)
- `year` (integer)
- `firstRoundResult` (text)
- `secondRoundResult` (text)
- `selectionFlowType` (text)
- `status` (StoryStatus)
- `reviewNotes` (text)

## 注意事項

- このマイグレーションは既存のデータを保持します
- `IF NOT EXISTS` / `IF EXISTS` チェックにより、安全に複数回実行できます
- 既存のカラム名が変更される場合がありますが、データは保持されます

## 完了後

マイグレーション適用後、体験記の投稿が正常に動作するはずです。

もし問題が続く場合は、以下の情報を共有してください：
1. マイグレーション実行時のエラーメッセージ
2. 上記の確認クエリの結果
3. 投稿時のエラーメッセージ
