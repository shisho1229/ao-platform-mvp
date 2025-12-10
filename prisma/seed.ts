import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを投入中...');

  // 体験記を3件作成
  console.log('📝 体験記を作成中...');
  
  await prisma.experience.create({
    data: {
      university: '早稲田大学',
      faculty: '政治経済学部',
      year: 2024,
      authorPseudonym: '匿名A',
      jukuName: 'AO義塾',
      selectionProcess: '一次選考: 書類審査(志望理由書1,200字、活動報告書800字)\n二次選考: 個人面接30分',
      interviewQuestions: JSON.stringify([
        '志望理由を3分で説明してください',
        '活動報告書の地域ボランティアについて詳しく教えてください',
        '入学後にやりたいことは具体的に何ですか?',
        'なぜ慶應ではなく早稲田なのですか?',
        '卒業後はどのような進路を考えていますか?'
      ]),
      interviewAtmosphere: '面接官3名(40代男性2名、30代女性1名)。和やかな雰囲気で、笑顔で質問してくださいました。圧迫的な質問は一切なく、私の活動について興味を持って深掘りしてくれた印象です。',
      preparationTips: '志望理由書は夏休みから準備を始め、4回の添削を受けました。特に第2段落のエピソードの書き方を変えたことで、説得力が格段に上がりました。面接対策は予想質問を50個作り、すべてに対する回答を準備しました。',
      adviceToJuniors: '「自分の経験を学問と結びつける」ことを常に意識してください。単なる経験の羅列ではなく、「なぜその経験が重要なのか」「そこから何を学び、大学で何を研究したいのか」を明確に示すことが合格の鍵だと思います。',
      motivationTheme: '地域経済の活性化とデータ分析',
      motivationStructure: '第1段落: 問題意識(地方の過疎化)\n第2段落: 自身の経験(ボランティア活動)\n第3段落: 大学で学びたいこと(計量経済学)\n第4段落: 卒業後のビジョン(シンクタンク)',
    },
  });

  await prisma.experience.create({
    data: {
      university: '慶應義塾大学',
      faculty: 'SFC',
      year: 2024,
      authorPseudonym: '匿名B',
      jukuName: '洋々',
      selectionProcess: '一次選考: 書類審査\n二次選考: プレゼンテーション + 質疑応答',
      interviewQuestions: JSON.stringify([
        'あなたの研究テーマについて5分でプレゼンしてください',
        'このテーマを選んだ理由は?',
        'SFCで何を学びたいですか?',
        '先行研究は調べましたか?'
      ]),
      interviewAtmosphere: '面接官2名。プレゼン後の質疑応答が活発で、研究の深掘りをされました。厳しいというより、研究に対する本気度を見られている感じでした。',
      preparationTips: 'プレゼン資料の作成に2週間かけました。何度も練習して、5分ぴったりに収まるように調整しました。',
      adviceToJuniors: 'SFCは自分の研究テーマを明確に持つことが重要です。「なぜSFCなのか」を具体的に説明できるようにしてください。',
      motivationTheme: 'データサイエンスと社会課題解決',
      motivationStructure: '問題提起 → 自分の取り組み → SFCで学ぶ理由 → 将来の展望',
    },
  });

  await prisma.experience.create({
    data: {
      university: '上智大学',
      faculty: '外国語学部',
      year: 2024,
      authorPseudonym: '匿名C',
      jukuName: 'AO義塾',
      selectionProcess: '一次選考: 書類審査\n二次選考: 個人面接 + 英語面接',
      interviewQuestions: JSON.stringify([
        'Why do you want to study at Sophia?',
        'Tell me about your volunteer experience.',
        '外国語を学ぶ意義は何だと思いますか?',
        '入学後はどの言語を重点的に学びますか?'
      ]),
      interviewAtmosphere: '英語面接は10分程度。思ったより優しかったです。英語力よりも、コミュニケーション能力を見られていると感じました。',
      preparationTips: '英語面接の対策に1ヶ月かけました。ネイティブの先生と週2回練習しました。',
      adviceToJuniors: '英語力は必須です。日常会話レベルは必要ですが、完璧である必要はありません。自分の意見を英語で伝えられれば大丈夫です。',
    },
  });

  console.log('✅ 体験記3件を作成しました');

  // 塾スタッフを作成
  console.log('👤 塾スタッフを作成中...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.staff.create({
    data: {
      email: 'staff@ao-juku.com',
      name: '山田太郎',
      password: hashedPassword,
      jukuName: 'AO義塾',
      role: 'ADMIN',
    },
  });

  console.log('✅ 塾スタッフを作成しました');

  // サンプル書類を作成
  console.log('📄 サンプル書類を作成中...');
  
  await prisma.document.create({
    data: {
      jukuName: 'AO義塾',
      university: '早稲田大学',
      faculty: '政治経済学部',
      year: 2024,
      documentType: '志望理由書',
      title: '2024年度 早稲田・政経 合格者A',
      fullText: `私が早稲田大学政治経済学部を志望する理由は、地域経済の活性化に関する研究を深めたいからです。

私は高校2年生の時、地元の商店街活性化プロジェクトにボランティアとして参加しました。そこで、過疎化が進む地方都市の現状を目の当たりにし、データに基づいた政策立案の重要性を痛感しました。

貴学の計量経済学研究室では、統計データを用いた実証分析を学ぶことができます。また、○○ゼミでは地域経済をテーマにしたフィールドワークも行われており、理論と実践の両面から学べる環境が整っています。

将来は、シンクタンクで地方創生に関する政策提言を行いたいと考えています。貴学で学んだデータ分析の手法を活かし、持続可能な地域社会の実現に貢献したいです。

以上の理由から、私は早稲田大学政治経済学部で学びたいと考えています。`,
    },
  });

  console.log('✅ サンプル書類を作成しました');
  console.log('🎉 シードデータの投入が完了しました!');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });