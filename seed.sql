-- 探究テーマを作成
INSERT INTO "ExplorationTheme" ("name", "description") VALUES
('国際・グローバル', '国際関係、グローバル課題、多文化共生など'),
('政治・公共政策', '政治学、公共政策、行政、ガバナンスなど'),
('法・人権・社会正義', '法学、人権問題、社会正義、平等など'),
('経済・ビジネス', '経済学、経営学、マーケティング、金融など'),
('起業・イノベーション', 'スタートアップ、新規事業、技術革新など'),
('環境・サステナビリティ', '環境問題、持続可能性、気候変動など'),
('教育・子ども', '教育学、子どもの権利、学習支援など'),
('医療・福祉・健康', '医療、福祉、公衆衛生、ウェルビーイングなど'),
('スポーツ・身体', 'スポーツ科学、健康科学、体育など'),
('文化・芸術・メディア', '文化研究、芸術、メディア、コミュニケーションなど'),
('科学・テクノロジー', '科学技術、情報工学、データサイエンスなど'),
('地域・社会課題', '地域活性化、まちづくり、社会課題解決など');

-- ユーザーを作成（パスワード: password123のハッシュ値）
INSERT INTO "User" ("email", "name", "password", "role") VALUES
('admin@example.com', '管理者', '$2a$10$YQ8P.Qh5kVjWPZ3qE7qD0OxGxGJZKmT5YvD7VhJ8pE5QxJ5J5J5J5', 'ADMIN'),
('staff@example.com', '山田太郎', '$2a$10$YQ8P.Qh5kVjWPZ3qE7qD0OxGxGJZKmT5YvD7VhJ8pE5QxJ5J5J5J5', 'STAFF'),
('graduate1@example.com', '佐藤花子', '$2a$10$YQ8P.Qh5kVjWPZ3qE7qD0OxGxGJZKmT5YvD7VhJ8pE5QxJ5J5J5J5', 'GRADUATE'),
('graduate2@example.com', '鈴木一郎', '$2a$10$YQ8P.Qh5kVjWPZ3qE7qD0OxGxGJZKmT5YvD7VhJ8pE5QxJ5J5J5J5', 'GRADUATE'),
('student@example.com', '田中次郎', '$2a$10$YQ8P.Qh5kVjWPZ3qE7qD0OxGxGJZKmT5YvD7VhJ8pE5QxJ5J5J5J5', 'STUDENT');
