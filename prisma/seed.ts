import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを投入中...');

  // 探究テーマ（固定12分類）を作成
  console.log('🎯 探究テーマを作成中...');

  const themes = [
    { name: '国際・グローバル', description: '国際関係、グローバル課題、多文化共生など' },
    { name: '政治・公共政策', description: '政治学、公共政策、行政、ガバナンスなど' },
    { name: '法・人権・社会正義', description: '法学、人権問題、社会正義、平等など' },
    { name: '経済・ビジネス', description: '経済学、経営学、マーケティング、金融など' },
    { name: '起業・イノベーション', description: 'スタートアップ、新規事業、技術革新など' },
    { name: '環境・サステナビリティ', description: '環境問題、持続可能性、気候変動など' },
    { name: '教育・子ども', description: '教育学、子どもの権利、学習支援など' },
    { name: '医療・福祉・健康', description: '医療、福祉、公衆衛生、ウェルビーイングなど' },
    { name: 'スポーツ・身体', description: 'スポーツ科学、健康科学、体育など' },
    { name: '文化・芸術・メディア', description: '文化研究、芸術、メディア、コミュニケーションなど' },
    { name: '科学・テクノロジー', description: '科学技術、情報工学、データサイエンスなど' },
    { name: '地域・社会課題', description: '地域活性化、まちづくり、社会課題解決など' },
  ];

  for (const theme of themes) {
    await prisma.explorationTheme.create({
      data: theme,
    });
  }

  console.log('✅ 探究テーマ12件を作成しました');

  // ユーザーを作成
  console.log('👤 ユーザーを作成中...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Staff
  const staff = await prisma.user.create({
    data: {
      email: 'staff@example.com',
      name: '山田太郎',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  // User (旧Graduate)
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: '佐藤花子',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: '鈴木一郎',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // User (旧Student)
  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      name: '田中次郎',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log('✅ ユーザー5件を作成しました');

  // 合格体験記を作成
  console.log('📝 合格体験記を作成中...');

  // 体験記1: 早稲田大学 政治経済学部
  const story1 = await prisma.graduateStory.create({
    data: {
      authorId: user1.id,
      gender: 'FEMALE',
      highSchoolLevel: 'LEVEL_3',
      highSchoolName: '都立青山高等学校',
      gradeAverage: 'RANGE_4',
      admissionType: '総合型選抜',
      university: '早稲田大学',
      faculty: '政治経済学部',
      researchTheme: '地域経済の活性化とデータに基づいた政策立案',
      researchMotivation: '地元商店街の衰退を目の当たりにし、経済学の知見を活用して地域課題を解決したいと考えました。',
      researchDetails: 'アンケート調査とSNS分析を組み合わせたデータ収集を実施し、統計的手法で分析しました。商店街のインスタグラムアカウントを立ち上げ、フォロワー3,000人超を獲得。来客数が前年比30%増加という成果を出しました。',
      targetProfessor: '計量経済学を専門とする教授のもとで、実証研究の手法を学びたいです。',
      hasSportsAchievement: false,
      hasEnglishQualification: true,
      englishQualification: '英検2級（高2取得）、TOEIC L&R 750点（高3取得）',
      hasStudyAbroad: false,
      hasLeaderExperience: true,
      leaderExperienceDetails: '生徒会副会長（高3）',
      hasContestAchievement: true,
      contestAchievementDetails: '地域活性化コンテストで優秀賞を受賞',
      interviewQuestions: `- 志望理由を3分で説明してください
- 活動報告書の地域ボランティアについて詳しく教えてください
- 入学後にやりたいことは具体的に何ですか?
- なぜ慶應ではなく早稲田なのですか?
- 卒業後はどのような進路を考えていますか?`,
      documentPreparation: `志望理由書は夏休みから準備を始め、4回の添削を受けました。特に第2段落のエピソードの書き方を変えたことで、説得力が格段に上がりました。`,
      secondRoundPreparation: `面接対策は予想質問を50個作り、すべてに対する回答を準備しました。塾の先生と週1回模擬面接を実施。`,
      materials: '参考書：「総合型選抜の教科書」「政治経済入門」\n添削：塾での4回の添削指導',
      adviceToJuniors: '「自分の経験を学問と結びつける」ことを常に意識してください。単なる経験の羅列ではなく、「なぜその経験が重要なのか」「そこから何を学び、大学で何を研究したいのか」を明確に示すことが合格の鍵だと思います。',
    },
  });

  // 探究テーマを関連付け（経済・ビジネス、地域・社会課題）
  await prisma.storyExplorationTheme.createMany({
    data: [
      { storyId: story1.id, themeId: 4 }, // 経済・ビジネス
      { storyId: story1.id, themeId: 12 }, // 地域・社会課題
    ],
  });

  // 併願校
  await prisma.concurrentApplication.createMany({
    data: [
      { storyId: story1.id, university: '慶應義塾大学', faculty: '経済学部', result: 'REJECTED' },
      { storyId: story1.id, university: '上智大学', faculty: '経済学部', result: 'ACCEPTED' },
    ],
  });

  // 体験記2: 慶應義塾大学 SFC
  const story2 = await prisma.graduateStory.create({
    data: {
      authorId: user2.id,
      gender: 'MALE',
      highSchoolLevel: 'LEVEL_4',
      highSchoolName: '開成高等学校',
      gradeAverage: 'RANGE_5',
      admissionType: '総合型選抜（AO入試）',
      university: '慶應義塾大学',
      faculty: '総合政策学部',
      researchTheme: 'データサイエンスを活用した地域課題解決',
      researchMotivation: '観光客の動向をデータで可視化し、地域活性化につなげたいと考えました。',
      researchDetails: '高校1年生からプログラミングを独学し、地域の課題解決アプリを開発。地元の観光情報を多言語で提供するWebアプリを制作しました。アプリの利用データを分析し、観光客の行動パターンを研究しました。アプリは1,500ダウンロードを達成。市の観光協会にも採用され、実際に観光客に利用されています。',
      targetProfessor: 'データサイエンスとソーシャルイノベーションを専門とする教授のゼミに入りたいです。',
      hasSportsAchievement: true,
      sportsDetails: 'サッカー',
      sportsAchievements: ['都道府県ベスト8', '地方大会出場（関東大会など）'],
      hasEnglishQualification: true,
      englishQualification: '英検準1級（高2取得）、TOEFL iBT 85点（高3取得）',
      hasStudyAbroad: true,
      studyAbroadDetails: 'アメリカ（高2夏休み、1ヶ月）',
      hasLeaderExperience: true,
      leaderExperienceDetails: 'サッカー部キャプテン（高3）',
      hasContestAchievement: true,
      contestAchievementDetails: 'U-22プログラミングコンテストでファイナリスト',
      interviewQuestions: `- あなたの研究テーマについて5分でプレゼンしてください
- このテーマを選んだ理由は?
- SFCで何を学びたいですか?
- 先行研究は調べましたか?
- 技術的な課題はどう解決しましたか?`,
      documentPreparation: `研究計画書は3ヶ月かけて作成し、10回以上のブラッシュアップを重ねました。`,
      secondRoundPreparation: `プレゼン資料の作成に2週間かけました。何度も練習して、5分ぴったりに収まるように調整しました。`,
      materials: '参考書：「データサイエンス入門」「AO入試完全ガイド」\nオンライン講座：Coursera「Machine Learning」',
      adviceToJuniors: 'SFCは自分の研究テーマを明確に持つことが重要です。「なぜSFCなのか」を具体的に説明できるようにしてください。また、実際に手を動かして何かを作った経験があると強いです。',
    },
  });

  // 探究テーマを関連付け（科学・テクノロジー、地域・社会課題）
  await prisma.storyExplorationTheme.createMany({
    data: [
      { storyId: story2.id, themeId: 11 }, // 科学・テクノロジー
      { storyId: story2.id, themeId: 12 }, // 地域・社会課題
    ],
  });

  // 併願校
  await prisma.concurrentApplication.createMany({
    data: [
      { storyId: story2.id, university: '早稲田大学', faculty: '基幹理工学部', result: 'ACCEPTED' },
    ],
  });

  console.log('✅ 合格体験記2件を作成しました');
  console.log('🎉 シードデータの投入が完了しました!');
  console.log('\n📋 作成されたユーザー:');
  console.log('  - Admin: admin@example.com / password123');
  console.log('  - Staff: staff@example.com / password123');
  console.log('  - User1: user1@example.com / password123');
  console.log('  - User2: user2@example.com / password123');
  console.log('  - User3: user3@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });