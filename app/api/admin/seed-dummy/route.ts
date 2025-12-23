import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/seed-dummy - ダミー投稿を作成
export async function POST() {
  try {
    const session = await auth()

    // 管理者権限チェック
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    // ユーザーを取得
    const user = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF", "USER"] } },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 400 })
    }

    // 探究テーマを取得
    const themes = await prisma.explorationTheme.findMany()
    if (themes.length === 0) {
      return NextResponse.json({ error: "探究テーマが見つかりません" }, { status: 400 })
    }

    const dummyStories = [
      {
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
        themeIds: [2, 12],
      },
      {
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
        themeIds: [7, 11],
      },
      {
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
        themeIds: [3, 5],
      },
      {
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
        themeIds: [6, 10],
      },
      {
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
        themeIds: [2, 4],
      },
      {
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
        themeIds: [1, 3],
      },
      {
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
        themeIds: [10, 11],
      },
      {
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
        themeIds: [1, 10],
      },
      {
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
        themeIds: [2, 11],
      },
      {
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
        themeIds: [1, 10],
      },
    ]

    const createdStories = []

    for (const story of dummyStories) {
      const { themeIds, ...storyData } = story

      // 有効なテーマIDのみを使用
      const validThemeIds = themeIds.filter(id =>
        themes.some(theme => theme.id === id)
      )

      // テーマがない場合は最初の2つを使用
      const finalThemeIds = validThemeIds.length > 0
        ? validThemeIds
        : [themes[0].id, themes[1]?.id || themes[0].id]

      const created = await prisma.graduateStory.create({
        data: {
          authorId: user.id,
          ...storyData,
          status: "PUBLISHED",
          published: true,
          explorationThemes: {
            create: finalThemeIds.map(themeId => ({ themeId })),
          },
        },
      })
      createdStories.push(created)
    }

    return NextResponse.json({
      success: true,
      message: `${createdStories.length}件のダミー投稿を作成しました`,
      stories: createdStories.map(s => ({
        id: s.id,
        authorName: s.authorName,
        university: s.university,
        faculty: s.faculty,
      })),
    })
  } catch (error) {
    console.error("ダミー投稿作成エラー:", error)
    return NextResponse.json(
      { error: "ダミー投稿の作成に失敗しました", details: String(error) },
      { status: 500 }
    )
  }
}
