# 合格体験談プラットフォーム（AO Platform MVP）

## 概要

塾内利用を前提とした合格体験談の蓄積・検索システムです。
生徒が「自分に近い合格者」を探せることを主目的としています。

## 主な機能

### ユーザーロール
- **Admin（管理者）**
- **Staff（講師・スタッフ）**
- **Graduate（合格者）**: 体験談投稿が可能
- **Student（在籍生徒）**: 体験談閲覧・検索が可能

### 機能一覧
1. **体験談投稿**（Graduate専用）
   - 基礎属性（性別、高校偏差値帯、評定平均、入試方式など）
   - 探究テーマ（12分類から複数選択）
   - 活動内容・実績
   - 選考情報・対策方法
   - 後輩へのアドバイス

2. **体験談閲覧**（全ユーザー）
   - 体験談一覧表示
   - 詳細ページでの全情報閲覧
   - 探究テーマによるフィルタリング

3. **類似合格者検索**（全ユーザー）
   - 高校偏差値帯、評定平均、探究テーマなどで検索
   - スコアリングアルゴリズムによる類似度計算
   - 類似度順に体験談を表示

4. **合格書類管理**（Admin/Staff専用）
   - PDF書類のアップロード・閲覧
   - 生徒への対面での画面共有を想定

## 探究テーマ（12分類）

1. 国際・グローバル
2. 政治・公共政策
3. 法・人権・社会正義
4. 経済・ビジネス
5. 起業・イノベーション
6. 環境・サステナビリティ
7. 教育・子ども
8. 医療・福祉・健康
9. スポーツ・身体
10. 文化・芸術・メディア
11. 科学・テクノロジー
12. 地域・社会課題

## 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS

## セットアップ

### 必要な環境
- Node.js 20以上
- PostgreSQL

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# .envファイルを編集してデータベース接続情報を設定
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"

# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init

# シードデータの投入
npx prisma db seed

# 開発サーバーの起動
npm run dev
```

### テストアカウント

シードデータで以下のアカウントが作成されます：

- **Admin**: admin@example.com / password123
- **Staff**: staff@example.com / password123
- **Graduate1**: graduate1@example.com / password123
- **Graduate2**: graduate2@example.com / password123
- **Student**: student@example.com / password123

## データベーススキーマ

### 主要モデル
- `User`: ユーザー（Admin, Staff, Graduate, Student）
- `GraduateStory`: 合格体験談
- `ExplorationTheme`: 探究テーマ（固定12分類）
- `StoryExplorationTheme`: 体験談と探究テーマの中間テーブル
- `ConcurrentApplication`: 併願校情報
- `AdmissionDocument`: 合格書類（PDF）

## 類似度スコアリング

生徒向け検索機能では以下のアルゴリズムで類似度を計算：

- 高校偏差値帯一致 → +2
- 評定レンジ一致 → +2
- 入試方式一致 → +2
- 探究テーマ一致 → +2
- 英語資格レベル一致 → +1
- 英語Lv3以上同士 → +1
- 実績（スポーツ/リーダー）一致 → +1ずつ

最大スコア: 13点
類似度％ = (スコア / 13) × 100

## プロジェクト構成

```
app/
├── page.tsx                      # ホームページ
├── auth/
│   └── signin/page.tsx          # ログインページ
├── stories/
│   ├── page.tsx                 # 体験談一覧
│   ├── [id]/page.tsx            # 体験談詳細
│   └── new/page.tsx             # 体験談投稿（Graduate専用）
├── search/page.tsx              # 類似合格者検索
└── api/
    ├── auth/[...nextauth]/      # NextAuth API
    ├── stories/                 # 体験談API
    ├── stories/search/          # 検索API
    └── themes/                  # 探究テーマAPI

components/
├── HomePage.tsx                 # ホームページコンポーネント
└── Navbar.tsx                   # ナビゲーションバー

lib/
├── prisma.ts                    # Prismaクライアント
└── auth.ts                      # 認証ユーティリティ

prisma/
├── schema.prisma                # データベーススキーマ
└── seed.ts                      # シードデータ
```

## デプロイ

```bash
# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start
```

## 今後の拡張予定

- 合格書類のPDFアップロード機能の完全実装
- データ分析・可視化機能
- CSV出力機能
- 検索フィルターの強化
- 管理者ダッシュボード

## ライセンス

このプロジェクトはMVP（最小実用製品）として作成されました。
