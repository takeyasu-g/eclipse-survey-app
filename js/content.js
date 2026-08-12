const content = {
  EN: {
    introSlides: [
      {
        type: "title",
        title: "ECLIPSE",
        tagline:
          "Everyone Creates・Lives・Inspires\nThe Passion to Serve Each Other",
      },
      {
        type: "whoAreWe",
        title: "WHO ARE WE?",
        body: 'An international youth circle,\ngathered to pursue and spread\nwhat has "true value" —\nunchanged across time and place.',
      },
      {
        type: "suicideStats",
        title: "Youth Depression",
        caption:
          "Japan's youth suicide rate —\n#1 among OECD countries for 20+ years",
        stats: [
          {
            percent: "30%",
            label: "of 18–22 year olds\nhave seriously considered suicide",
          },
          {
            percent: "11%",
            label: "of 18–22 year olds\nhave attempted suicide",
          },
        ],
        source: "Nippon Foundation Journal",
      },
      {
        type: "mentalIllness",
        body: "1 in 5 people will experience\nsome form of mental illness in their lifetime.",
      },
    ],
    topics: {
      connection: "Connection",
      education: "Education",
      romance: "Romance",
      work: "Work",
      time: "Time",
      heart: "Heart",
      service: "Service",
      lifeview: "Life View",
      philosophy: "Philosophy",
      luck: "Luck",
    },
    questions: {
      connection: [
        "What is your ideal kind of relationship?",
        "Do you want to get married in the future?",
        "When do you feel the difficulty of human relationships?",
        "What does a loving relationship look like?",
        "Is there a relationship you feel God has given you?",
      ],
      education: [
        "What does being independent look like to you?",
        "What do you want to grow in from now on?",
        "What do people need in order to grow?",
        "Where does growth stop — what causes it?",
        "What kind of education do you think is important?",
        "What kind of growth do you think God hopes for?",
      ],
      romance: [
        "What kind of person do you want to marry?",
        "What kind of preparation do you want to make for marriage?",
        "What is love? Have you ever experienced something you felt was love?",
        "Why do you think people cheat?",
        "Do you want to build a family with the same atmosphere as your current family?",
        "What encounter do you feel God gave you?",
      ],
      time: [
        "What do you want to spend your time on?",
        "What makes you feel busy these days?",
        "Who do you most enjoy spending time with?",
        "What do you think love is?",
        "What do you think God has given you?",
      ],
      heart: [
        "What emotions do you think are important?",
        "What has moved you recently?",
        "When do you feel the pangs of conscience?",
        "What is love? Have you ever experienced something you felt was love?",
        "What kind of heart do you think God has given you?",
      ],
      service: [
        "How do you feel when you act for someone else?",
        "What's something someone did for you that made you happy?",
        "What do you think truly benefits another person?",
        "What is love? What is needed in order to love?",
        "What would you like to do for God?",
      ],
      lifeview: [
        "What do you value most in life?",
        "What purpose do you live for?",
        "What do you think happens after death?",
        "What does a life of love look like?",
        "What do you think God has given you?",
      ],
      philosophy: [
        "What philosopher or way of thinking do you like?",
        "What purpose do you live for?",
        "People have sought happiness throughout history — why do you think unhappiness still exists?",
        "What do you think love is?",
        "What do you think God has given you?",
      ],
      luck: [
        "Has anything happened to you that felt like more than coincidence?",
        "When do you think good luck continues?",
        "What kind of heart do you think attracts good luck?",
        "What do you think love is?",
        "What mission do you think God has given you?",
      ],
    },
    quickQuestions: [
      { text: "What's an experience that moved you to tears?" },
      { text: "What's a moment where you felt love?" },
      { text: "What's the hardest thing you've ever gone through?" },
      { text: "What do you feel God has given you?" },
      {
        text: "Do you ever feel contradictions in your heart?",
        examples: [
          "I have things to do but keep putting them off",
          "I want to be glad for others' success but end up jealous",
          "I want to be honest but end up covering things up",
          "I want to take care of my health but can't stop",
        ],
      },
    ],
    outroSlides: [
      {
        type: "closer",
        title: "ECLIPSE",
        subtitle: "When the heart changes, the world changes",
        tagline:
          "Everyone Creates・Lives・Inspires\nThe Passion to Serve Each Other",
      },
      {
        type: "showcase",
        title: "ECLIPSE",
      },
      {
        type: "activities",
        title: "ECLIPSE",
        items: [{ label: "Symposiums" }, { label: "Events" }],
      },
    ],
    sermons: {
      posture: "Posture is Key",
      lifeWithGod: "Life with God",
      happiness: "Happiness & My Heart",
      plants: "Plants are Aware",
      communication: "What is Real Communication?",
      humanNeverDies: "Human Never Dies",
      treasure: "What's Your Treasure?",
      marriage: "What is Marriage?",
      dna: "The DNA of Happiness",
      freedom: "What is Real Freedom?",
      environment: "Environmental Issues",
      everything: "Everything Happens for a Reason",
    },
    ui: {
      quickSurveyButton: "Quick Survey",
      fullSurveyButton: "Full Survey",
      resultsButton: "View Results",
      skipButton: "Skip",
      skipTopicButton: "Skip Topic",

      languageToggle: "日本語", // shown while in EN

      endTitle: "Thank You",
      endBody: "Thank you for taking the time to talk with us today.",

      resultsTitle: "Results",
      resultsEmpty: "No surveys completed yet.",
      copyAllButton: "Copy All",
      copyButton: "Copy",
      copyConfirm: "Copied!",
      topicsLabel: "Topics:",
      sermonsLabel: "Sermons:",
      topicsLockToast: "Select 3 topics to continue",
      sermonsLockToast: "Select 1–3 sermons to continue",
      topicGridPrompt: "What matters most to you?",
    },
  },
  JP: {
    introSlides: [
      // Slide 1 — Title
      {
        type: "title",
        title: "ECLIPSE",
        tagline:
          "Everyone Creates・Lives・Inspires\nThe Passion to Serve Each Other",
      },

      // Slide 2 — Who are we
      {
        type: "whoAreWe",
        title: "WHO ARE WE?",
        body: '時代や場所が違っても変わらない\n"本当に価値があるもの"を追求し\nそれを広めていくことを目的に\n集まった、国際青年サークルです',
      },

      // Slide 3 — Suicide stats
      {
        type: "suicideStats",
        title: "青少年うつ病",
        caption: "日本若者自殺率\n20年以上 OECD国家1位",
        stats: [
          { percent: "30%", label: "18〜22歳中\n自殺を本気で考えたことがある" },
          { percent: "11%", label: "18〜22歳中\n自殺未遂を経験したことがある" },
        ],
        source: "日本財団ジャーナル",
      },

      // Slide 4 — Mental illness
      {
        type: "mentalIllness",
        body: "5人に1人は一生の間に\n何らかの精神疾患にかかる",
      },
    ],
    topics: {
      connection: "つながり",
      education: "教育",
      romance: "恋愛",
      work: "仕事",
      time: "時間",
      heart: "心",
      service: "奉仕・貢献",
      lifeview: "人生観",
      philosophy: "哲学",
      luck: "運",
    },
    questions: {
      connection: [
        "どんな人間関係が理想ですか？",
        "将来結婚はしたいですか？",
        "どんな時に人間関係の難しさを感じますか？",
        "愛がある関係とはどんな関係ですか？",
        "神様からもらっているなと思う関係はありますか？",
      ],
      education: [
        "自立した状態はどんな状態だと思いますか？",
        "これから成長したいことは何ですか？",
        "人が成長するためには何が必要ですか？",
        "成長が止まる原因はどこにありますか？",
        "どんな教育が大事だと思いますか？",
        "神様はどんな成長を願っていると思いますか？",
      ],
      romance: [
        "どんな相手と結婚したいですか？",
        "結婚のためにどんな準備をしたいですか？",
        "愛とはどんなものですか？これは愛だと感じた経験はありますか？",
        "なぜ人は浮気をすると思いますか？",
        "今の家族と同じ雰囲気の家族を作りたいですか？",
        "神様がくれたと思う出逢いは何ですか？",
      ],
      time: [
        "どんなことに時間を使いたいですか？",
        "今はどんなことに忙しさを感じますか？",
        "誰と過ごす時間が一番嬉しいですか？",
        "愛とは何だと思いますか？",
        "神様からもらってるものは何ですか？",
      ],
      heart: [
        "どんな感情が大事だと思いますか？",
        "最近感動したことは何ですか？",
        "どんな時に良心の呵責を感じますか？",
        "愛とは何だと思いますか？これが愛だと思った出来事はありますか？",
        "神様からどんな心をもらっていると思いますか？",
      ],
      service: [
        "誰かの為に動くときにどんな気持ちになりますか？",
        "相手が自分にしてくれて嬉しかった経験は何ですか？",
        "本当に相手の為になることは何だと思いますか？",
        "愛とは何ですか？愛するために必要なことは何ですか？",
        "神様のためにどんなことをしたいですか？",
      ],
      lifeview: [
        "人生で一番大切にしていることはなんですか？",
        "どんな生きる目的を持っていますか？",
        "死んだ後はどうなると思いますか？",
        "愛のある人生とはどんな人生ですか？",
        "神様からもらってると思うものは何ですか？",
      ],
      philosophy: [
        "好きな哲学者、考え方は何ですか？",
        "どんな生きる目的を持っていますか？",
        "人は歴史をかけて幸せを求めてきても未だに不幸があるのはなぜですか？",
        "愛とは何だと思いますか？",
        "神様からもらっているものは何ですか？",
      ],
      luck: [
        "これまでに偶然とは思えない出来事はありましたか？",
        "どんな時に良い運が続くと思いますか？",
        "運を引き寄せるにはどんな心が大事だと思いますか？",
        "愛とは何だと思いますか？",
        "神様がくれている使命は何だと思いますか？",
      ],
    },
    quickQuestions: [
      { text: "涙が流れるほど感動した経験は何ですか？" },
      { text: "愛を感じた出来事は何ですか？" },
      { text: "今まで一番苦労したことは何ですか？" },
      { text: "神様からもらったものは何ですか？" },
      {
        text: "心に矛盾を感じることはありますか？",
        examples: [
          "やるべきことがあるのに先延ばしにしてしまう",
          "人の成功を喜びたいのに嫉妬してしまう",
          "正直でいたいのに誤魔化してしまう",
          "健康のために節制したいのにやめられない",
        ],
      },
    ],
    outroSlides: [
      // Outro 1 — closer with tagline
      {
        type: "closer",
        title: "ECLIPSE",
        subtitle: "心が変われば世界が変わる",
        tagline:
          "Everyone Creates・Lives・Inspires\nThe Passion to Serve Each Other",
      },

      // Outro 2 — ECLIPSE + 3 posters (images defined in screen function)
      {
        type: "showcase",
        title: "ECLIPSE",
      },

      // Outro 3 — シンポジウム / イベント
      {
        type: "activities",
        title: "ECLIPSE",
        items: [{ label: "シンポジウム" }, { label: "イベント" }],
      },
    ],
    sermons: {
      posture: "姿勢は鍵",
      lifeWithGod: "神様のいる生活",
      happiness: "幸福と私の心",
      plants: "植物は気づいている",
      communication: "本当のコミュニケーションとは？",
      humanNeverDies: "人は死なない",
      treasure: "あなたにとっての宝物は？",
      marriage: "結婚とは？",
      dna: "幸せのDNA",
      freedom: "本当の自由とは？",
      environment: "環境問題編",
      everything: "すべての物には意味がある",
    },
    ui: {
      quickSurveyButton: "クイック調査",
      fullSurveyButton: "フル調査",
      resultsButton: "結果を見る",
      skipButton: "スキップ",
      skipTopicButton: "トピックをスキップ",

      languageToggle: "English", // shown while in JP

      endTitle: "ありがとうございました",
      endBody: "本日はお時間をいただき、ありがとうございました。",

      resultsTitle: "結果",
      resultsEmpty: "まだ調査結果がありません。",
      copyAllButton: "すべてコピー",
      copyButton: "コピー",
      copyConfirm: "コピーしました！",
      topicsLabel: "トピック:",
      sermonsLabel: "メッセージ:",
      topicsLockToast: "3つのトピックを選んでください",
      sermonsLockToast: "メッセージを1〜3つ選んでください",
      topicGridPrompt: "重要だと思うものはありますか？",
    },
  },
};

const topicsByMode = {
  full: [
    "connection",
    "education",
    "romance",
    "time",
    "heart",
    "service",
    "lifeview",
    "philosophy",
    "luck",
  ],
  quick: [
    "connection",
    "time",
    "work",
    "philosophy",
    "education",
    "luck",
    "lifeview",
    "heart",
    "service",
  ],
};

const sermons = [
  { id: "posture", image: "sermon-01.png" },
  { id: "lifeWithGod", image: "sermon-02.png" },
  { id: "happiness", image: "sermon-03.png" },
  { id: "plants", image: "sermon-04.png" },
  { id: "communication", image: "sermon-05.png" },
  { id: "humanNeverDies", image: "sermon-06.png" },
  { id: "treasure", image: "sermon-07.png" },
  { id: "marriage", image: "sermon-08.png" },
  { id: "dna", image: "sermon-09.png" },
  { id: "freedom", image: "sermon-10.png" },
  { id: "environment", image: "sermon-11.png" },
  { id: "everything", image: "sermon-12.png" },
];
