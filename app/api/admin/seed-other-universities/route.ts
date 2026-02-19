import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/admin/seed-other-universities - 早慶以外のダミー投稿を作成
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
      // 上智大学
      {
        authorName: "木村優花",
        gender: "FEMALE" as const,
        highSchoolLevel: "LEVEL_3" as const,
        highSchoolName: "私立雙葉高等学校",
        gradeAverage: "RANGE_4" as const,
        campus: "渋谷",
        admissionType: "公募制推薦入試",
        university: "上智大学",
        faculty: "外国語学部",
        year: 2024,
        researchTheme: "多言語教育と異文化理解の促進",
        researchMotivation: "幼少期をフランスで過ごし、多言語環境の中で育った経験から言語教育に興味を持った。",
        researchDetails: "日本とフランスの外国語教育を比較研究し、効果的な多言語教育のあり方を論文にまとめた。",
        targetProfessor: "吉田研作教授のもとで、言語教育政策について研究したい。",
        interviewQuestions: "・多言語話者としての経験について\n・日本の英語教育の課題は？",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "フランスと日本の教育制度の違いを具体例を交えて説明した。",
        secondRoundPreparation: "言語習得理論の基礎を勉強した。",
        materials: "『言語教育学入門』大修館書店",
        adviceToJuniors: "海外経験は大きな武器。その経験をどう活かすかを明確にしよう。",
        hasEnglishQualification: true,
        englishQualification: "DELF B2、英検準1級",
        themeIds: [1, 10],
      },
      // 青山学院大学
      {
        authorName: "松本翔太",
        gender: "MALE" as const,
        highSchoolLevel: "LEVEL_2" as const,
        highSchoolName: "都立国際高等学校",
        gradeAverage: "RANGE_3" as const,
        campus: "武蔵小杉",
        admissionType: "自己推薦入試",
        university: "青山学院大学",
        faculty: "国際政治経済学部",
        year: 2024,
        researchTheme: "東南アジアにおける日本企業のCSR活動",
        researchMotivation: "タイへの短期留学中に、日系企業の地域貢献活動に触れ関心を持った。",
        researchDetails: "日系企業5社の東南アジアでのCSR活動をインタビュー調査。報告書を作成した。",
        targetProfessor: "山本武彦教授のもとで、アジアビジネスと企業倫理について学びたい。",
        interviewQuestions: "・CSRとは何か説明してください\n・なぜ東南アジアに興味があるのですか？",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "調査結果をグラフや表で可視化した。",
        secondRoundPreparation: "国際経済学と企業論の基礎を学んだ。",
        materials: "『CSR入門』日経文庫",
        adviceToJuniors: "フィールドワークの経験は面接で活きる。実際に動くことが大事。",
        hasStudyAbroad: true,
        studyAbroadDetails: "タイ（高2、2ヶ月間）",
        themeIds: [3, 5],
      },
      // 明治大学
      {
        authorName: "井上陽菜",
        gender: "FEMALE" as const,
        highSchoolLevel: "LEVEL_3" as const,
        highSchoolName: "県立千葉高等学校",
        gradeAverage: "RANGE_4" as const,
        campus: "下北沢",
        admissionType: "AO入試",
        university: "明治大学",
        faculty: "情報コミュニケーション学部",
        year: 2024,
        researchTheme: "SNSにおけるフェイクニュースの拡散メカニズム",
        researchMotivation: "コロナ禍でのデマ拡散を見て、情報リテラシーの重要性を痛感した。",
        researchDetails: "Twitterでのフェイクニュース拡散パターンを分析。リテラシー教育の提言をまとめた。",
        targetProfessor: "大黒岳彦教授のもとで、メディア論と情報社会について研究したい。",
        interviewQuestions: "・フェイクニュースをどう見分けますか？\n・SNSの功罪について",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "分析結果をデータで示し、具体的な対策を提案した。",
        secondRoundPreparation: "メディア論の入門書を読み込んだ。",
        materials: "『フェイクニュースの生態系』青弓社",
        adviceToJuniors: "身近な問題から研究テーマを見つけよう。",
        themeIds: [10, 11],
      },
      // 立教大学
      {
        authorName: "山口大地",
        gender: "MALE" as const,
        highSchoolLevel: "LEVEL_2" as const,
        highSchoolName: "私立立教池袋高等学校",
        gradeAverage: "RANGE_3" as const,
        campus: "自由が丘",
        admissionType: "自由選抜入試",
        university: "立教大学",
        faculty: "観光学部",
        year: 2024,
        researchTheme: "地方観光地のサステナブルツーリズム",
        researchMotivation: "祖父母の住む地方の観光地が衰退していく様子を見て、持続可能な観光のあり方を考えた。",
        researchDetails: "長野県の温泉地でフィールドワークを実施。地元住民と観光客双方にインタビュー調査を行った。",
        targetProfessor: "東徹教授のもとで、観光まちづくりについて学びたい。",
        interviewQuestions: "・サステナブルツーリズムとは？\n・地方創生に観光はどう貢献できますか？",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "フィールドワークの記録と分析結果をポートフォリオにまとめた。",
        secondRoundPreparation: "観光学と地域経済学の基礎を学んだ。",
        materials: "『観光学入門』有斐閣",
        adviceToJuniors: "現場に行くことで見えてくるものがある。足を使おう。",
        themeIds: [6, 12],
      },
      // 中央大学
      {
        authorName: "藤田美月",
        gender: "FEMALE" as const,
        highSchoolLevel: "LEVEL_3" as const,
        highSchoolName: "私立桐朋女子高等学校",
        gradeAverage: "RANGE_4" as const,
        campus: "渋谷",
        admissionType: "自己推薦入試",
        university: "中央大学",
        faculty: "法学部",
        year: 2024,
        researchTheme: "少年法改正と更生プログラムの効果",
        researchMotivation: "少年犯罪のニュースを見て、罰則強化だけでなく更生支援の重要性を考えるようになった。",
        researchDetails: "更生保護施設でのボランティア活動を通じて、更生プログラムの現状と課題をレポートにまとめた。",
        targetProfessor: "只木誠教授のもとで、刑事法と少年法について研究したい。",
        interviewQuestions: "・少年法改正についてどう思いますか？\n・更生と処罰のバランスについて",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "ボランティア経験と法的考察を結びつけた。",
        secondRoundPreparation: "刑法と少年法の基礎を勉強した。",
        materials: "『少年法入門』有斐閣、『刑事政策』成文堂",
        adviceToJuniors: "法学部は理論だけでなく現場を知ることも大切。",
        themeIds: [2, 3],
      },
      // 学習院大学
      {
        authorName: "田村航平",
        gender: "MALE" as const,
        highSchoolLevel: "LEVEL_2" as const,
        highSchoolName: "私立学習院高等科",
        gradeAverage: "RANGE_3" as const,
        campus: "武蔵小杉",
        admissionType: "AO入試",
        university: "学習院大学",
        faculty: "国際社会科学部",
        year: 2024,
        researchTheme: "日本の対アフリカ外交と経済協力",
        researchMotivation: "TICAD（アフリカ開発会議）のニュースを見て、日本とアフリカの関係に興味を持った。",
        researchDetails: "日本のODAがアフリカ諸国に与えた影響を文献調査。ケニアの事例を中心に分析した。",
        targetProfessor: "青山瑠妙教授のもとで、国際関係論を学びたい。",
        interviewQuestions: "・なぜアフリカに興味があるのですか？\n・ODAの効果と課題について",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "アフリカ開発に関するレポートを提出した。",
        secondRoundPreparation: "国際関係論と開発経済学の入門書を読んだ。",
        materials: "『国際開発入門』東洋経済新報社",
        adviceToJuniors: "マイナーなテーマでも深く掘り下げれば強みになる。",
        themeIds: [1, 4],
      },
      // 明治学院大学
      {
        authorName: "吉田莉子",
        gender: "FEMALE" as const,
        highSchoolLevel: "LEVEL_2" as const,
        highSchoolName: "県立横浜国際高等学校",
        gradeAverage: "RANGE_4" as const,
        campus: "下北沢",
        admissionType: "AO入試",
        university: "明治学院大学",
        faculty: "心理学部",
        year: 2024,
        researchTheme: "SNS利用と若者のメンタルヘルス",
        researchMotivation: "友人がSNSでの誹謗中傷で悩んでいるのを見て、デジタル時代の心理的健康について考えた。",
        researchDetails: "高校生100名にアンケート調査を実施。SNS利用時間とストレスレベルの相関を分析した。",
        targetProfessor: "伊藤正哉教授のもとで、臨床心理学を学びたい。",
        interviewQuestions: "・SNSの心理的影響について\n・カウンセリングに興味はありますか？",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "統計分析の結果をグラフで示した。",
        secondRoundPreparation: "心理学の入門書を複数読んだ。",
        materials: "『心理学入門』有斐閣",
        adviceToJuniors: "データに基づいた議論ができると説得力が増す。",
        themeIds: [8, 11],
      },
      // 上智大学 2つ目
      {
        authorName: "佐々木健",
        gender: "MALE" as const,
        highSchoolLevel: "LEVEL_3" as const,
        highSchoolName: "私立栄光学園高等学校",
        gradeAverage: "RANGE_5" as const,
        campus: "オンライン",
        admissionType: "公募制推薦入試",
        university: "上智大学",
        faculty: "経済学部",
        year: 2024,
        researchTheme: "行動経済学を活用したナッジ政策",
        researchMotivation: "ノーベル経済学賞を受賞したリチャード・セイラーの研究に感銘を受けた。",
        researchDetails: "学校内でナッジを活用した食品ロス削減実験を実施。効果を数値で検証した。",
        targetProfessor: "竹田茂夫教授のもとで、行動経済学と公共政策について学びたい。",
        interviewQuestions: "・ナッジとは何ですか？\n・実験の結果について教えてください",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "実験のデザインと結果を論文形式でまとめた。",
        secondRoundPreparation: "行動経済学の主要な研究を読み込んだ。",
        materials: "『行動経済学入門』日経文庫、『実践行動経済学』日経BP",
        adviceToJuniors: "理論を実践で検証する姿勢が評価される。",
        themeIds: [4, 7],
      },
      // 青山学院大学 2つ目
      {
        authorName: "森田彩乃",
        gender: "FEMALE" as const,
        highSchoolLevel: "LEVEL_2" as const,
        highSchoolName: "私立青山学院高等部",
        gradeAverage: "RANGE_4" as const,
        campus: "自由が丘",
        admissionType: "自己推薦入試",
        university: "青山学院大学",
        faculty: "総合文化政策学部",
        year: 2024,
        researchTheme: "アートを活用した都市再生プロジェクト",
        researchMotivation: "瀬戸内国際芸術祭を訪れ、アートが地域に与える影響力に感動した。",
        researchDetails: "国内外のアートプロジェクトを比較研究。地域活性化への効果を分析した。",
        targetProfessor: "内田真理教授のもとで、文化政策とアートマネジメントを学びたい。",
        interviewQuestions: "・印象に残ったアートプロジェクトは？\n・文化政策の課題について",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "訪問した芸術祭のレポートとポートフォリオを作成した。",
        secondRoundPreparation: "文化政策学の基礎と芸術祭の歴史を勉強した。",
        materials: "『アートプロジェクト』水曜社",
        adviceToJuniors: "実際に足を運んで体験することが大切。",
        hasSportsAchievement: true,
        sportsDetails: "ダンス部（全国大会出場）",
        themeIds: [9, 12],
      },
      // 立教大学 2つ目
      {
        authorName: "岡田拓海",
        gender: "MALE" as const,
        highSchoolLevel: "LEVEL_3" as const,
        highSchoolName: "県立大宮高等学校",
        gradeAverage: "RANGE_3" as const,
        campus: "青葉台",
        admissionType: "アスリート選抜入試",
        university: "立教大学",
        faculty: "スポーツウエルネス学部",
        year: 2024,
        researchTheme: "部活動の地域移行と子どものスポーツ機会",
        researchMotivation: "部活動顧問の働き方改革のニュースを見て、地域移行の影響を考えた。",
        researchDetails: "地域スポーツクラブでコーチングを経験。子どもたちへの調査も行った。",
        targetProfessor: "松尾哲矢教授のもとで、スポーツ社会学を学びたい。",
        interviewQuestions: "・部活動の地域移行についてどう思いますか？\n・自身の競技経験について",
        firstRoundResult: "合格",
        secondRoundResult: "合格",
        documentPreparation: "競技実績と研究レポートの両方を提出した。",
        secondRoundPreparation: "スポーツ政策と教育論について勉強した。",
        materials: "『スポーツ社会学入門』杏林書院",
        adviceToJuniors: "アスリートとしての経験を学問に活かそう。",
        hasSportsAchievement: true,
        sportsDetails: "サッカー（全国高校サッカー選手権出場）",
        themeIds: [8, 12],
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
      count: createdStories.length,
      message: `${createdStories.length}件のダミー投稿を作成しました（早慶以外）`,
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
