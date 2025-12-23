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

  // Admin (SUPER_ADMIN)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      approved: true,
    },
  });

  // Staff
  const staff = await prisma.user.create({
    data: {
      email: 'staff@example.com',
      name: '山田太郎',
      password: hashedPassword,
      role: 'STAFF',
      approved: true,
    },
  });

  // User (旧Graduate)
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: '佐藤花子',
      password: hashedPassword,
      role: 'USER',
      approved: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: '鈴木一郎',
      password: hashedPassword,
      role: 'USER',
      approved: true,
    },
  });

  // User (旧Student)
  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      name: '田中次郎',
      password: hashedPassword,
      role: 'USER',
      approved: true,
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

  // 追加のダミー体験記を作成
  console.log('📝 追加のダミー体験記を作成中...');

  const dummyStories = [
    {
      authorId: user1.id,
      authorName: "山田太郎",
      gender: "MALE" as const,
      highSchoolLevel: "LEVEL_3" as const,
      highSchoolName: "都立西高等学校",
      gradeAverage: "RANGE_4" as const,
      campus: "渋谷",
      admissionType: "FIT入試",
      university: "慶應義塾大学",
      faculty: "法学部政治学科",
      year: 2024,
      researchTheme: "地方創生における若者の政治参加促進",
      researchMotivation: "地元の過疎化問題を目の当たりにし、若い世代がどうすれば地域政治に参加できるか考えるようになった。",
      researchDetails: "地元自治体でのインターンシップを通じて、若者の政治参加を促進するためのSNS活用策を提案。実際に市議会で発表する機会を得た。",
      targetProfessor: "小林良彰教授の政治行動論研究室で、投票行動と政治参加について学びたい。",
      interviewQuestions: JSON.stringify(["なぜ政治学科を志望したのですか？", "地方創生について具体的にどのような政策が有効だと思いますか？"]),
      firstRoundResult: "A合格",
      secondRoundResult: "A合格",
      documentPreparation: "志望理由書は10回以上書き直した。具体的なエピソードを盛り込むことを意識した。",
      secondRoundPreparation: "模擬面接を20回以上実施。時事問題についても毎日ニュースをチェックした。",
      materials: "『政治学入門』有斐閣、『地方自治論』東京大学出版会",
      adviceToJuniors: "早めに志望理由を固めることが大切。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [2, 12],
    },
    {
      authorId: user2.id,
      authorName: "佐藤花子",
      gender: "FEMALE" as const,
      highSchoolLevel: "LEVEL_2" as const,
      highSchoolName: "私立桜蔭高等学校",
      gradeAverage: "RANGE_5" as const,
      campus: "武蔵小杉",
      admissionType: "春AO",
      university: "慶應義塾大学",
      faculty: "総合政策学部",
      year: 2024,
      researchTheme: "AIを活用した教育格差の解消",
      researchMotivation: "家庭教師のアルバイトで、経済的な理由で十分な教育を受けられない子どもたちと出会った。",
      researchDetails: "プログラミングを独学で学び、学習支援アプリのプロトタイプを開発。地域のNPOと協力して実証実験を行った。",
      targetProfessor: "國領二郎教授のもとで、デジタル社会における教育のあり方を研究したい。",
      interviewQuestions: JSON.stringify(["開発したアプリについて詳しく教えてください", "SFCでなければならない理由は？"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "自分のプロジェクトを具体的に説明できるよう、データや成果を整理した。",
      secondRoundPreparation: "プレゼン資料を何度も作り直し、短時間で伝えられるよう練習した。",
      materials: "『ソーシャルデザイン実践ガイド』英治出版",
      adviceToJuniors: "自分のプロジェクトを持っていると強い。小さくてもいいので実際に行動することが大切。",
      hasEnglishQualification: true,
      englishQualification: "TOEFL iBT 95点",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [7, 11],
    },
    {
      authorId: user1.id,
      authorName: "鈴木一郎",
      gender: "MALE" as const,
      highSchoolLevel: "LEVEL_4" as const,
      highSchoolName: "開成高等学校",
      gradeAverage: "RANGE_3" as const,
      campus: "下北沢",
      admissionType: "FIT入試",
      university: "慶應義塾大学",
      faculty: "法学部法律学科",
      year: 2024,
      researchTheme: "スタートアップ企業と法規制のあり方",
      researchMotivation: "高校生起業家として活動する中で、既存の法規制がイノベーションを阻害していると感じた。",
      researchDetails: "自らECサイトを運営しながら、特定商取引法や景品表示法について研究。法改正の提言をまとめた。",
      targetProfessor: "宮沢節生教授の法社会学研究室で、法と経済の関係について学びたい。",
      interviewQuestions: JSON.stringify(["起業経験について教えてください", "法律と経済のバランスについてどう考えますか？"]),
      firstRoundResult: "B合格",
      secondRoundResult: "B合格",
      documentPreparation: "起業経験を法的観点から分析した論文を別途提出した。",
      secondRoundPreparation: "法学の基礎知識を身につけるため、入門書を読み込んだ。",
      materials: "『法学入門』有斐閣、『スタートアップの法務』日本加除出版",
      adviceToJuniors: "自分のユニークな経験を大切に。それを学問とどう結びつけるかがポイント。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [3, 5],
    },
    {
      authorId: user2.id,
      authorName: "田中美咲",
      gender: "FEMALE" as const,
      highSchoolLevel: "LEVEL_3" as const,
      highSchoolName: "県立浦和第一女子高等学校",
      gradeAverage: "RANGE_4" as const,
      campus: "渋谷",
      admissionType: "夏秋AO",
      university: "慶應義塾大学",
      faculty: "環境情報学部",
      year: 2024,
      researchTheme: "持続可能なファッション産業の構築",
      researchMotivation: "ファストファッションの環境負荷について学び、サステナブルなファッションのあり方を探求したいと思った。",
      researchDetails: "古着のリメイクブランドを立ち上げ、環境に配慮した素材選びから販売まで一貫して行った。",
      targetProfessor: "脇田玲教授のもとで、デザインとテクノロジーの融合について学びたい。",
      interviewQuestions: JSON.stringify(["なぜファッションに興味を持ったのですか？", "環境問題とビジネスの両立について"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "自分のブランドのポートフォリオを作成し、ビジネスプランも添付した。",
      secondRoundPreparation: "環境問題に関する最新データを頭に入れておいた。",
      materials: "『サステナブル・ファッション』繊維社",
      adviceToJuniors: "好きなことを追求することが一番。その熱意が面接官に伝わります。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [6, 10],
    },
    {
      authorId: user1.id,
      authorName: "高橋健太",
      gender: "MALE" as const,
      highSchoolLevel: "LEVEL_2" as const,
      highSchoolName: "都立日比谷高等学校",
      gradeAverage: "RANGE_3" as const,
      campus: "オンライン",
      admissionType: "自己推薦入試",
      university: "早稲田大学",
      faculty: "政治経済学部",
      year: 2024,
      researchTheme: "日本の財政再建と世代間格差",
      researchMotivation: "少子高齢化による社会保障費の増大が、若い世代の負担増につながることに問題意識を持った。",
      researchDetails: "財政データを分析し、世代別の負担と受益のバランスを可視化。論文にまとめて学会で発表した。",
      targetProfessor: "原田泰教授のマクロ経済学研究室で財政政策について学びたい。",
      interviewQuestions: JSON.stringify(["財政再建の具体策を教えてください", "世代間格差をどう解消しますか？"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "データに基づいた論理的な志望理由書を心がけた。",
      secondRoundPreparation: "経済学の基礎と時事問題を徹底的に勉強した。",
      materials: "『マクロ経済学』有斐閣、『日本財政入門』日本経済新聞出版",
      adviceToJuniors: "データで語れると説得力が増す。統計の基礎は押さえておこう。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [2, 4],
    },
    {
      authorId: user2.id,
      authorName: "伊藤さくら",
      gender: "FEMALE" as const,
      highSchoolLevel: "LEVEL_3" as const,
      highSchoolName: "私立豊島岡女子学園高等学校",
      gradeAverage: "RANGE_5" as const,
      campus: "武蔵小杉",
      admissionType: "公募制推薦入試",
      university: "上智大学",
      faculty: "総合グローバル学部",
      year: 2024,
      researchTheme: "難民問題と日本の受け入れ体制",
      researchMotivation: "難民支援のボランティアに参加し、日本の難民認定率の低さに疑問を持った。",
      researchDetails: "難民申請者へのインタビュー調査を実施。彼らが直面する課題を報告書にまとめ、政策提言を行った。",
      targetProfessor: "内藤正典教授のもとで、移民・難民政策について比較研究を行いたい。",
      interviewQuestions: JSON.stringify(["難民問題に関心を持ったきっかけは？", "日本はもっと難民を受け入れるべきですか？"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "ボランティア活動の記録と、自分なりの政策提言をまとめた。",
      secondRoundPreparation: "国際法や人権に関する基礎知識を身につけた。",
      materials: "『難民問題』岩波新書、『移民・難民』中公新書",
      adviceToJuniors: "現場を知ることが大切。フィールドワークの経験は強みになる。",
      hasStudyAbroad: true,
      studyAbroadDetails: "フィリピン（高2夏、3週間）難民キャンプでボランティア",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [1, 3],
    },
    {
      authorId: user1.id,
      authorName: "渡辺翔太",
      gender: "MALE" as const,
      highSchoolLevel: "LEVEL_2" as const,
      highSchoolName: "県立湘南高等学校",
      gradeAverage: "RANGE_3" as const,
      campus: "自由が丘",
      admissionType: "FIT入試",
      university: "慶應義塾大学",
      faculty: "総合政策学部",
      year: 2025,
      researchTheme: "eスポーツの社会的価値と産業発展",
      researchMotivation: "プロゲーマーを目指す中で、eスポーツが持つ可能性と課題に気づいた。",
      researchDetails: "eスポーツ大会を主催し、地域活性化に貢献。参加者へのアンケート調査も実施した。",
      targetProfessor: "武田圭史教授のもとで、デジタルエンターテイメント産業について研究したい。",
      interviewQuestions: JSON.stringify(["eスポーツの将来性について", "ゲームと勉強の両立について"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "イベント運営の実績と、産業分析レポートを提出した。",
      secondRoundPreparation: "eスポーツ産業の市場規模や課題について深く調べた。",
      materials: "『eスポーツ論』NHK出版",
      adviceToJuniors: "趣味も極めれば武器になる。自分の好きなことを学問に結びつけよう。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [10, 11],
    },
    {
      authorId: user2.id,
      authorName: "中村あかり",
      gender: "FEMALE" as const,
      highSchoolLevel: "LEVEL_3" as const,
      highSchoolName: "私立女子学院高等学校",
      gradeAverage: "RANGE_4" as const,
      campus: "渋谷",
      admissionType: "自由選抜入試",
      university: "立教大学",
      faculty: "異文化コミュニケーション学部",
      year: 2024,
      researchTheme: "多言語環境における言語アイデンティティ",
      researchMotivation: "帰国子女として、複数の言語と文化の間で揺れる自分のアイデンティティについて考えるようになった。",
      researchDetails: "帰国子女20名へのインタビュー調査を実施。言語とアイデンティティの関係を論文にまとめた。",
      targetProfessor: "鳥飼玖美子教授の通訳翻訳研究室で学びたい。",
      interviewQuestions: JSON.stringify(["帰国子女としての経験について", "言語アイデンティティとは何か"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "自分の研究をコンパクトにまとめた。英語と日本語の両方で準備した。",
      secondRoundPreparation: "言語学と異文化コミュニケーションの基礎を勉強した。",
      materials: "『言語と文化』大修館書店",
      adviceToJuniors: "自分のバックグラウンドを強みに変えよう。ユニークな経験は宝物。",
      hasEnglishQualification: true,
      englishQualification: "英検1級、TOEIC 980点",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [1, 10],
    },
    {
      authorId: user1.id,
      authorName: "小林大輔",
      gender: "MALE" as const,
      highSchoolLevel: "LEVEL_4" as const,
      highSchoolName: "灘高等学校",
      gradeAverage: "RANGE_2" as const,
      campus: "オンライン",
      admissionType: "FIT入試",
      university: "慶應義塾大学",
      faculty: "環境情報学部",
      year: 2025,
      researchTheme: "ブロックチェーンによる投票システムの構築",
      researchMotivation: "選挙の低投票率問題を解決するため、テクノロジーを活用した新しい投票方法を考えた。",
      researchDetails: "Ethereumを使った投票システムのプロトタイプを開発。セキュリティと透明性を両立させた設計を実現。",
      targetProfessor: "村井純教授のもとで、インターネットと民主主義の関係について研究したい。",
      interviewQuestions: JSON.stringify(["ブロックチェーンの仕組みを説明してください", "電子投票の課題は何ですか？"]),
      firstRoundResult: "AB合格",
      secondRoundResult: "AB合格",
      documentPreparation: "開発したシステムのソースコードと技術文書を提出した。",
      secondRoundPreparation: "ブロックチェーン技術と民主主義論を深く勉強した。",
      materials: "『マスタリングビットコイン』オライリー、『ブロックチェーン革命』日経BP",
      adviceToJuniors: "技術力だけでなく、なぜそれを作るのかというビジョンが大切。",
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [2, 11],
    },
    {
      authorId: user2.id,
      authorName: "加藤美優",
      gender: "FEMALE" as const,
      highSchoolLevel: "LEVEL_3" as const,
      highSchoolName: "私立渋谷教育学園幕張高等学校",
      gradeAverage: "RANGE_4" as const,
      campus: "青葉台",
      admissionType: "AO入試",
      university: "明治大学",
      faculty: "国際日本学部",
      year: 2024,
      researchTheme: "日本のポップカルチャーと文化外交",
      researchMotivation: "アニメや漫画が世界中で人気を集める中、これをソフトパワーとして活用する可能性に興味を持った。",
      researchDetails: "海外のアニメファン100名にオンラインアンケートを実施。日本文化への関心と理解度の関係を分析した。",
      targetProfessor: "藤本由香里教授のもとで、マンガ研究と文化外交について学びたい。",
      interviewQuestions: JSON.stringify(["なぜポップカルチャーに注目したのですか？", "文化外交の具体例を挙げてください"]),
      firstRoundResult: "合格",
      secondRoundResult: "合格",
      documentPreparation: "アンケート調査の結果を可視化し、考察をまとめた。",
      secondRoundPreparation: "日本の文化政策と外交史について勉強した。",
      materials: "『ポップカルチャー論』東京大学出版会",
      adviceToJuniors: "好きなことを研究に昇華させよう。熱意があれば道は開ける。",
      hasSportsAchievement: true,
      sportsDetails: "ダンス",
      sportsAchievements: ["全国大会出場", "都道府県優勝・準優勝"],
      status: "PUBLISHED" as const,
      published: true,
      themeIds: [1, 10],
    },
  ];

  for (const story of dummyStories) {
    const { themeIds, ...storyData } = story;
    const createdStory = await prisma.graduateStory.create({
      data: storyData,
    });
    await prisma.storyExplorationTheme.createMany({
      data: themeIds.map(themeId => ({ storyId: createdStory.id, themeId })),
    });
    console.log(`  ✓ ${storyData.authorName} - ${storyData.university} ${storyData.faculty}`);
  }

  console.log('✅ 追加のダミー体験記10件を作成しました');
  console.log('🎉 シードデータの投入が完了しました!');
  console.log('\n📋 作成されたユーザー:');
  console.log('  - SUPER_ADMIN: admin@example.com / password123');
  console.log('  - STAFF: staff@example.com / password123');
  console.log('  - USER: user1@example.com / password123');
  console.log('  - USER: user2@example.com / password123');
  console.log('  - USER: user3@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });