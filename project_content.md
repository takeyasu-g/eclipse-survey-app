# ECLIPSE Survey App — Project Context

> Add this file to every new chat so Claude understands the full project.

---

## Who This Is For

A friend asked the developer to build a web app to replace a PowerPoint survey tool used by **ECLIPSE** — a faith-based international youth group based in Japan. The app is used by a **surveyor** who holds the device and shows it to the person they are talking to.

---

## Stack

- Stack chosen: **plain HTML + CSS + JavaScript** (no frameworks — back to fundamentals)
- Will deploy for free on **GitHub Pages or Netlify** (no database needed)

---

## The App — What It Does

A slideshow-style survey tool that runs in a mobile browser (portrait and landscape).

### Flow

1. **Intro slides** (5 slides) — About ECLIPSE, mission, mental health stats
2. **Topic selection screen** — User picks 1 to 3 topics from 9 options (grid layout)
3. **Questions** — Only questions for chosen topics appear, grouped by topic. Maybe have surveyor, chose what questions to give. All
   questions in order. Or specific quesions from the topics chosen. (Something to think about how to make)
4. **Closing slides** — About ECLIPSE, events, contact info

### Topics (Japanese → English)

| Japanese   | English                |
| ---------- | ---------------------- |
| つながり   | Connection             |
| 教育       | Education              |
| 恋愛       | Love & Relationships   |
| 時間       | Time                   |
| 心         | Heart / Mind           |
| 奉仕・貢献 | Service & Contribution |
| 人生観     | Outlook on Life        |
| 哲学       | Philosophy             |
| 運         | Luck / Fortune         |

> Note: 歴史 (History) also appears in the PowerPoint (slides 58–64) but it is NOT on the topic selection screen (slide 6). Confirm with friend whether to include it. (looks like not part of the topics for now)

### Questions Per Topic

Each topic has 5 or 6 questions, and they need to be asked in order, as the questions get deeper.

**つながり (Connection) — 5 questions:**

1. どんな人間関係が理想ですか？ — What kind of relationships do you ideally want?
2. 将来結婚はしたいですか？ — Do you want to get married in the future?
3. どんな時に人間関係の難しさを感じますか？ — When do you feel relationships are difficult?
4. 愛がある関係とはどんな関係ですか？ — What does a loving relationship look like?
5. 神様からもらっているなと思う関係はありますか？ — Is there a relationship you feel is a gift from God?

**教育 (Education) — 6 questions:**

1. 自立した状態はどんな状態だと思いますか？ — What does being self-reliant look like to you?
2. これから成長したいことは何ですか？ — What do you want to grow in going forward?
3. 人が成長するためには何が必要ですか？ — What do people need in order to grow?
4. 成長が止まる原因はどこにありますか？ — What causes growth to stop?
5. どんな教育が大事だと思いますか？ — What kind of education do you think is important?
6. 神様はどんな成長を願っていると思いますか？ — What growth do you think God hopes for?

**恋愛 (Love & Relationships) — 6 questions:**

1. どんな相手と結婚したいですか？ — What kind of person do you want to marry?
2. 結婚のためにどんな準備をしたいですか？ — How do you want to prepare for marriage?
3. 愛とはどんなものですか？これは愛だと感じた経験はありますか？ — What is love? Have you experienced it?
4. なぜ人は浮気をすると思いますか？ — Why do you think people are unfaithful?
5. 今の家族と同じ雰囲気の家族を作りたいですか？ — Do you want to create a family like your current one?
6. 神様がくれたと思う出逢いは何ですか？ — What encounter do you feel was given to you by God?

**時間 (Time) — 5 questions:**

1. どんなことに時間を使いたいですか？ — What do you want to spend your time on?
2. 今はどんなことに忙しさを感じますか？ — What keeps you busy right now?
3. 誰と過ごす時間が一番嬉しいですか？ — Who do you most enjoy spending time with?
4. 愛とは何だと思いますか？ — What do you think love is?
5. 神様からもらってるものは何ですか？ — What do you feel you've received from God?

**心 (Heart / Mind) — 5 questions:**

1. どんな感情が大事だと思いますか？ — What emotions do you think are important?
2. 最近感動したことは何ですか？ — What has moved or inspired you recently?
3. どんな時に良心の呵責を感じますか？ — When do you feel a pang of conscience?
4. 愛とは何だと思いますか？これが愛だと思った出来事はありますか？ — What is love? Any moments that felt like love?
5. 神様からどんな心をもらっていると思いますか？ — What kind of heart do you feel God has given you?

**奉仕・貢献 (Service & Contribution) — 5 questions:**

1. 誰かの為に動くときにどんな気持ちになりますか？ — How do you feel when you act for someone else?
2. 相手が自分にしてくれて嬉しかった経験は何ですか？ — What's something someone did for you that made you happy?
3. 本当に相手の為になることは何だと思いますか？ — What do you think truly benefits others?
4. 愛とは何ですか？愛するために必要なことは何ですか？ — What is love? What does it take to love someone?
5. 神様のためにどんなことをしたいですか？ — What would you like to do for God?

**人生観 (Outlook on Life) — 5 questions:**

1. 人生で一番大切にしていることはなんですか？ — What do you value most in life?
2. どんな生きる目的を持っていますか？ — What purpose do you live for?
3. 死んだ後はどうなると思いますか？ — What do you think happens after death?
4. 愛のある人生とはどんな人生ですか？ — What does a life full of love look like?
5. 神様からもらってると思うものは何ですか？ — What do you feel you've received from God?

**哲学 (Philosophy) — 5 questions:**

1. 好きな哲学者、考え方は何ですか？ — What philosopher or way of thinking do you like?
2. どんな生きる目的を持っていますか？ — What purpose do you live for?
3. 人は歴史をかけて幸せを求めてきても未だに不幸があるのはなぜですか？ — Why does unhappiness still exist despite humanity seeking happiness throughout history?
4. 愛とは何だと思いますか？ — What do you think love is?
5. 神様からもらっているものは何ですか？ — What do you feel you've received from God?

**運 (Luck / Fortune) — 5 questions:**

1. これまでに偶然とは思えない出来事はありましたか？ — Have you had experiences that felt like more than coincidence?
2. どんな時に良い運が続くと思いますか？ — When do you think good luck continues?
3. 運を引き寄せるにはどんな心が大事だと思いますか？ — What mindset attracts good luck?
4. 愛とは何だと思いますか？ — What do you think love is?
5. 神様がくれている使命は何だと思いますか？ — What mission do you think God has given you?

---

## Design

- **Color scheme:** Warm cream/beige background, yellow-orange buttons, cloud and star decorations
- **Feel:** Friendly, approachable, slightly whimsical
- **Font:** Japanese-friendly (needs to support Japanese characters)
- **Layout:** Mobile-first, works both portrait and landscape(priority)
- **Assests:** Some images will be used from the power point
- **Language toggle:** Japanese / English switch

---

## Current Progress

- [ ] Project setup (folder + files)
- [ ] Intro slides
- [ ] Topic selection screen
- [ ] Question flow logic
- [ ] Closing slides
- [ ] Language toggle (JP/EN)
- [ ] Deployment

---
