# ECLIPSE — Project Reference

> This is the single source of truth for the ECLIPSE survey app. It supersedes
> the original project brief and any earlier drafts of this file where they
> conflict. Read this fully before writing any code.

---

## What This Is

A bilingual (Japanese/English) mobile web app used by ECLIPSE, an
international youth circle, for street outreach surveys. A **surveyor** holds
the phone in landscape mode and walks through the app with the person they're
talking to. The person being surveyed never touches the surveyor home screen
or results screen — those are surveyor-only.

---

## Key Facts

| | |
|---|---|
| Orientation | Locked to landscape |
| Hosting | GitHub Pages (private repo) |
| Languages | Japanese + English, toggleable at any time |
| Font | M PLUS Rounded 1c (covers both JP + EN) |
| Backend / database | None — all data temporary, clears on app/browser close |
| Offline | Works fully offline after first load (PWA) |
| Framework | None — vanilla HTML/CSS/JS only |

---

## Tech Stack & Architecture

- **True SPA** — JavaScript builds everything dynamically into one root
  element. `index.html` is a near-empty shell (`<div id="app"></div>` plus
  script/style tags).
- **Render loop** — one central `render()` function in `app.js` reads
  `state.screen` and calls the matching screen function. Every state change
  is followed by `render()`.
  ```js
  state.something = newValue;
  render();
  ```
- **Navigation** — all screen changes go through `navigate(screen)` in
  `navigate.js`. No hash routing. App always boots to surveyor home on
  refresh.
- **Swipe handlers** — attached to `document` once at startup, never inside
  screen functions. Each screen defines its own behavior in a
  `swipeHandlers` object in `navigate.js`, one entry per screen.
- **Screen functions** — each screen gets its own function in `screens.js`.
  Almost no two screens share a layout, so don't try to force shared layout
  components — the shared pattern is "read text from `content.js`, return
  HTML," not identical markup.
- **Content** — all JP + EN text lives in `content.js`, complete (see
  Content Reference below). Every screen function reads via:
  ```js
  const t = content[state.language];
  ```
  The language toggle flips `state.language` and calls `render()`. The
  button always shows what you will switch **to**, not what you're
  currently on (this exact label is already in `content.js` as
  `ui.languageToggle`).
- **Event delegation** — topic grid and sermon picker each use one listener
  on their parent container, identifying items via `data-` attributes
  (`data-topic="connection"`, `data-sermon="posture"`).
- **Screen transitions** — CSS animation, both screens briefly in the DOM
  simultaneously, sliding: forward enters from the right, back enters from
  the left. Old screen removed after animation completes.
- **No inline styles from JS** — JS only toggles class names; all visual
  styling lives in CSS.

### File Structure
```
index.html
manifest.json
sw.js
assets/
  icons/          ← app icons + small decorative PNGs (deco-*.png)
  images/         ← sermon posters, showcase posters, intro/outro photos
  reference/       ← NOT loaded by the app — visual reference only, for dev use
css/
  main.css
  screens.css
  animations.css
js/
  app.js          ← boots the app, state object, render()
  navigate.js     ← navigate(), swipeHandlers, screen transition logic
  screens.js      ← all screen layout functions
  content.js      ← all JP + EN text (DONE — do not restructure without reason)
```

---

## State Object

```js
const state = {
  screen: "home",
  language: "JP",           // app always boots in Japanese
  mode: null,              // "quick" or "full"
  selectedTopics: [],      // max 3
  completedTopics: [],     // full mode only — includes topics finished OR skipped
  selectedSermons: [],     // 1–3
  sermonView: "focused",   // "focused" (3 at a time, scroll) or "grid" (all 12, no scroll)
  introSlideIndex: 0,
  outroSlideIndex: 0,
  questionIndex: 0,
  currentTopic: null,      // full mode only
  results: [],             // see Results Screen section
  copyControlsVisible: false, // results screen — whether Copy/Copy All buttons are shown
};
```

---

## Screen List

- Surveyor home
- Intro slides (4, including the ECLIPSE title slide as slide 1)
- 9-topic grid
- 3-topic menu *(full mode only)*
- Questions screen
- Outro slide 1
- Sermon picker
- Outro slide 2
- Outro slide 3
- Thank You / End screen
- Results screen

There is **no separate "title screen"** — the ECLIPSE title is the first of
the 4 intro slides, not its own step. The ECLIPSE tagline/"心が変われば世界が
変わる" content appears only once in the app, as `outroSlides[0]` — it is
**not** duplicated into `introSlides`.

---

## Full Survey Flow

| Step | Screen |
|---|---|
| 1 | Intro slides (4, swipeable) |
| 2 | 9-topic grid — pick exactly 3 |
| 3 | 3-topic menu — shows the 3 chosen topics, each with a Skip option. **No slide reference exists for this screen** (it's original to this app, not in the PowerPoint) — layout is 3 topic buttons stacked vertically top-to-bottom, same background and button style as the rest of the app. |
| 4 | Questions screen — per topic, surveyor reads aloud, can skip individual questions. Topic turns green when finished OR skipped. Re-entering a completed/skipped topic keeps it green. |
| 5 | Outro slide 1 |
| 6 | Sermon picker — pick 1–3 |
| 7 | Outro slide 2 |
| 8 | Outro slide 3 |
| 9 | Thank You / End — no left swipe. Home button only way out. |

## Quick Survey Flow

| Step | Screen |
|---|---|
| 1 | Intro slides (4, same as full) |
| 2 | 9-topic grid — pick exactly 3 (different topic list — see Topics below) |
| 3 | 5 fixed questions (same regardless of topic chosen) — **no skip button**; surveyor moves faster by simply swiping left through questions |
| 4 | Outro slide 1 |
| 5 | Sermon picker — pick 1–3 |
| 6 | Outro slide 2 |
| 7 | Outro slide 3 |
| 8 | Thank You / End — no left swipe. Home button only way out. |

---

## Skip Behavior (Full mode only)

Quick mode has no skip buttons anywhere — the surveyor achieves the same
effect by swiping left through the fixed 5 questions faster.

Full mode has two skip points:

1. **3-topic menu** — each of the 3 chosen topics has a Skip option. Skipping
   a topic marks it in `completedTopics` and turns it **green**, identical
   in appearance to a topic that was actually completed. There is no visual
   distinction between "answered" and "skipped" — both just mean "done with
   this topic."
2. **Questions screen** — a Skip button advances to the next question within
   the current topic (same direction as swiping left), for when the
   surveyor wants to jump past a specific question without finishing the
   whole topic early.

---

## Topics

Two different 9-topic sets depending on mode — full mode includes Romance,
quick mode substitutes Work in its place:

```js
const topicsByMode = {
  full:  ["connection","education","romance","time","heart","service","lifeview","philosophy","luck"],
  quick: ["connection","time","work","philosophy","education","luck","lifeview","heart","service"],
};
```

Topic grid: 9 pill buttons in a 3×3 grid. Tap to select/deselect, max 3 at
once. When 3 are selected, remaining unselected pills appear faded. When the
3-topic menu displays the chosen topics, order them by filtering the fixed
`topicsByMode` array (grid order), not by tap order:

```js
const orderedSelected = topicsByMode[state.mode].filter(topic =>
  state.selectedTopics.includes(topic)
);
```

---

## Navigation — Swipe Rules

| Action | Behavior |
|---|---|
| Swipe left | Move forward one step |
| Swipe right | Move back one step — per-screen behavior below |
| Device back button | Jump back to the previous full screen |
| Swipe on topic grid | Disabled until exactly 3 topics selected |
| Swipe on sermon picker | Disabled until at least 1 sermon selected |

When a swipe is locked (topic grid without exactly 3 selected, sermon
picker without 1–3 selected), show a brief toast telling the surveyor what's
needed — `ui.topicsLockToast` / `ui.sermonsLockToast` — same toast component
style as the copy confirmation (semi-transparent black background, white
text, fades after ~1.5–2s).

### Swipe Right — Per Screen

| Screen | Swipe Right Goes To |
|---|---|
| Surveyor home | Do nothing |
| Intro slides | Previous intro slide. On first slide → do nothing (it's already the first screen). |
| Topic grid | Last intro slide |
| 3-topic menu | Topic grid |
| Questions screen | Previous question. On first question → 3-topic menu (full) or topic grid (quick). Topics/progress stay green when revisiting. |
| Outro slide 1 | 3-topic menu (full) or questions screen (quick) |
| Sermon picker | Outro slide 1 |
| Outro slide 2 | Sermon picker |
| Outro slide 3 | Outro slide 2 |
| Thank You / End | Outro slide 3. **No left swipe from this screen.** |
| Results screen | No swipe (not part of the linear flow) |

---

## Top Bar — Home Button (replaces hamburger menu)

There is **no hamburger menu and no dropdown.** Instead: a single **Home
icon button**, top-left corner, visible on every screen, always tappable.

- Tapping it resets all survey state and returns to the surveyor home
  screen — same reset behavior described in the old brief for "Home."
- From the surveyor home screen, the surveyor can tap **View Results**
  (`ui.resultsButton`) to reach the results screen — so results are still
  reachable from anywhere, just via one extra tap (Home → View Results)
  instead of a dropdown. There is no separate "Results" label anywhere
  else; `ui.resultsButton` is the only one needed.
- **Implementation:** build this as an inline SVG (a simple house outline)
  directly in `screens.js`/`main.css`, not as an image asset. Do not look
  for or expect a `deco-home.png` — it doesn't exist. Inline SVG is used so
  the icon works fully offline with zero network dependency (no CDN icon
  library) and can inherit `currentColor` for easy theming.

Language toggle remains in the top-right corner, as before, on the surveyor
home screen.

---

## Surveyor Home Screen

- Home icon top-left (does nothing here, or simply stays — already home)
- Language toggle top-right
- Two mode buttons: **Quick Survey** / **Full Survey** (`ui.quickSurveyButton`
  / `ui.fullSurveyButton`)
- **View Results** button (`ui.resultsButton`)
- State resets whenever this screen is (re)entered

---

## Questions Screen

- **Full mode:** 5–6 questions per topic (education and romance have 6;
  everything else has 5), unique per topic, with a Skip button per question
- **Quick mode:** 5 fixed questions, identical every time regardless of
  chosen topics, no skip button, last question has sub-bullet examples
  shown on screen (`quickQuestions[4].examples`)
- Surveyor reads questions aloud — phone is a visual aid only, no input
  required from the person being surveyed

---

## Sermon Picker

- **Poster images have no baked-in text** — each is a plain illustration
  PNG (`sermon-01.png` → `sermon-12.png`). The bilingual title is rendered
  as real HTML text (from `content[state.language].sermons`), shown below
  each poster, so it can switch language.
- Tap a poster to select/deselect, must select 1–3 to proceed. Selection
  state (`state.selectedSermons`) is shared across both view modes below —
  switching views never clears a selection.
- Selecting/deselecting must not cause images to reload or flicker.
- **Two view modes**, controlled by `state.sermonView`, toggled via two
  icon buttons top-right of the screen (white square button, black outline
  icon — same visual treatment for both):
  - **Focused view** (`"focused"`, default) — 3 columns × 1 row visible,
    large posters with titles underneath, vertically scrollable to reveal
    the remaining 3 rows (12 sermons total, 4 rows of 3).
  - **Grid view** (`"grid"`) — all 12 visible at once, **no scroll** (4
    columns × 3 rows fits in landscape), smaller thumbnails, titles still
    shown but compact. Lets the surveyor scan everything before deciding.
  - Toggle icons are simple geometric shapes — build as **inline SVG**, no
    image asset: icon 1 = 3 stacked vertical bars (switches to Focused),
    icon 2 = grid of boxes (switches to Grid).
- **Why vertical scroll only, never horizontal:** the app's core navigation
  gesture is left/right swipe between screens. A horizontally-scrolling
  poster grid would conflict with that gesture — the surveyor could
  accidentally trigger "next screen" while trying to browse posters. Both
  view modes must only ever scroll vertically (or not at all).

---

## Outro Slide 2 — Showcase

Displays 3 real symposium posters (also plain images, not requiring
bilingual text since they're just decorative/showcase — title "ECLIPSE" is
the only real text on this slide):
- `showcase-01.png`, `showcase-02.png`, `showcase-03.png`

---

## Results Screen

Reachable only via Surveyor Home → View Results (not part of the linear
survey flow).

Each completed survey (reaching the Thank You screen) is appended to
`state.results` as an entry:

```js
{
  name: "Full Survey 1",   // editable — see naming rule below
  dateTime: "...",          // fixed, always shown, NOT editable/deletable
  mode: "full",              // kept as its own field even though implied by name
  topics: ["connection", "education", "romance"],   // stored as KEYS, not display text
  sermons: ["posture", "dna"],                        // stored as KEYS, not display text
}
```

- **Default name:** `"{Full|Quick} Survey {n}"` — a single shared counter
  across both modes, incremented in the order surveys are completed (e.g.
  Full Survey 1, Quick Survey 2, Full Survey 3 — regardless of how many of
  each mode).
- **Rename:** tap the name to edit it inline (e.g. surveyor renames to the
  interviewee's name). No separate rename button needed.
- **Topics/sermons stored as keys**, not display strings, so results
  render correctly in whichever language is active at view/copy time:
  ```js
  topics.map(key => content[state.language].topics[key]).join(", ")
  ```
  This logic lives in `screens.js`, not `content.js` — content.js stays
  pure data.
- **Copy controls are hidden by default** (`state.copyControlsVisible =
  false`) — landing on the results screen shows only the entries, no copy
  buttons, to avoid visual clutter.
- A single toggle button, labeled `ui.copyButton` ("Copy"), is always
  visible. Tapping it flips `state.copyControlsVisible` and re-renders:
  - When **true** — reveals a **Copy All** button (`ui.copyAllButton`,
    top-right) plus a **Copy** button on every individual entry.
  - When **false** — hides all of the above again.
  - The toggle button itself changes color/style to reflect its
    active/inactive state (CSS class toggle, e.g. `.active`).
- Tapping **Copy All** copies every entry as one text block. Tapping an
  entry's **Copy** copies just that entry.
- Both copy actions trigger the same shared toast: `ui.copyConfirm`
  ("Copied!"), semi-transparent black background, white text, fades out
  after ~1.5–2s.
- Empty state: `ui.resultsEmpty` when no results exist yet.
- Results persist across multiple surveys within the same session; cleared
  only when the app/browser is fully closed.

---

## Content Reference (`content.js`)

`content.js` is **complete** — do not restructure its shape without a good
reason. Structure:

```js
const content = {
  EN: { introSlides, topics, questions, quickQuestions, outroSlides, sermons, ui },
  JP: { introSlides, topics, questions, quickQuestions, outroSlides, sermons, ui },
};

const topicsByMode = { full: [...], quick: [...] };

const sermons = [ { id, image }, ... ];  // pairs sermon content keys to image filenames
```

Every screen reads via `content[state.language].<category>.<key>`. Topics
and sermons and results all reference each other by the same key strings
(e.g. `"connection"`, `"posture"`) — never by index, never by display text.

---

## PWA & Install Prompt

- `manifest.json` — `display: fullscreen` (or `standalone`, whichever plays
  better with the install prompt banner — confirm during build),
  `orientation: landscape`
- Service worker (`sw.js`) caches all app files, including all asset
  images, for full offline use after first load. Cache name is versioned —
  changing the string pushes an update to all users.
- **Install prompt popup**, shown on first open, only if the app isn't
  already installed:
  - Check `window.matchMedia('(display-mode: standalone)').matches` — if
    true, app is already installed, skip the popup entirely.
  - **Android/Chrome:** listen for the `beforeinstallprompt` event, store
    it, and show a custom popup with an "Install" button that calls
    `.prompt()` on it when tapped.
  - **iOS Safari:** `beforeinstallprompt` does not exist on iOS. Detect iOS
    Safari + not-installed, and show manual instructions instead ("Tap
    Share, then Add to Home Screen") rather than an automatic button.

---

## Visual Design

| Element | Detail |
|---|---|
| Background | Beige grid paper look — **built as CSS pattern**, not an image (so it never blurs/tiles oddly at any resolution) |
| Decorative elements | `deco-*.png` icons — clouds, stars, blocks, erasers, pencil-book, bulb, bulb-book-abc — scattered sparsely, varied size/rotation, absolutely positioned. See `assets/reference/reference-bg-scatter-*.png` for density/placement reference — **not meant to be recreated exactly**, just similar sparse scattered flavor. |
| Topic pills | Yellow rounded buttons |
| Sermon posters | Plain PNGs, no baked-in text (bilingual titles rendered as real HTML) |
| Ring charts (intro stats slide) | **Built as SVG**, not an image — animated: the colored arc grows from 0 to its target percentage when the slide enters view, using `stroke-dasharray`/`stroke-dashoffset` |
| Screen transitions | Sliding — forward from right, back from left |
| Top bar | Home icon (inline SVG) top-left on every screen; language toggle top-right on surveyor home |

---

## Asset Naming Convention

### `assets/images/`
```
sermon-01.png → sermon-12.png     (order matches sermons array in content.js:
                                    posture, lifeWithGod, happiness, plants,
                                    communication, humanNeverDies, treasure,
                                    marriage, dna, freedom, environment, everything)
showcase-01.png → showcase-03.png (outro slide 2 — 3 symposium posters)
outro-symposium.png                (outro slide 3 — zoom call photo)
outro-event.png                    (outro slide 3 — picnic/event photo)
intro-whoarewe.png                 (intro slide 2 — world map illustration)
intro-stats.png                    (intro slide 3 — suicide stats illustration, text removed)
intro-mentalhealth.png             (intro slide 4 — mental illness photo, icons baked in, no text)
```

### `assets/icons/`
```
deco-cloud.png
deco-star.png
deco-block.png
deco-eraser.png
deco-pencil-book.png
deco-bulb.png
deco-bulb-book-abc.png
icon-192.png                       (PWA app icon, home screen)
icon-512.png                       (PWA app icon, install/splash)
```

### `assets/reference/`
```
reference-bg-scatter-1.png
reference-bg-scatter-2.png
reference-slide-intro-title.png
reference-slide-intro-whoarewe.png
reference-slide-intro-stats.png
reference-slide-intro-mentalhealth.png
reference-slide-topic-grid.png
reference-slide-question.png
reference-slide-outro-closer.png
reference-slide-sermon-picker.png
reference-slide-outro-showcase.png
reference-slide-outro-activities.png
```
**Not loaded by the app.** These exist purely as visual reference for
development (human or AI) — button shapes, spacing, and colors from the
real PowerPoint slides, plus icon scatter density. **Not meant to be
recreated pixel-exact** — use for styling inspiration and layout guidance,
not a precise target. The `reference-slide-question.png` file covers both
full and quick mode, since their question screen layout is identical.
Screens with no PowerPoint origin (surveyor home, 3-topic menu, Thank You,
Results) have no slide reference — their layout is described in text in
this document instead.

---

## Screen → Asset Mapping

| Screen | Content Assets | Style Reference |
|---|---|---|
| Intro slide 1 (Title) | — | `reference-slide-intro-title.png` |
| Intro slide 2 (Who Are We) | `intro-whoarewe.png` | `reference-slide-intro-whoarewe.png` |
| Intro slide 3 (Stats) | `intro-stats.png` | `reference-slide-intro-stats.png` |
| Intro slide 4 (Mental Illness) | `intro-mentalhealth.png` | `reference-slide-intro-mentalhealth.png` |
| 9-topic grid | — | `reference-slide-topic-grid.png` |
| 3-topic menu | — | *(none — see Full Survey Flow table for layout)* |
| Questions screen (full & quick) | — | `reference-slide-question.png` |
| Outro slide 1 (Closer) | — | `reference-slide-outro-closer.png` |
| Sermon picker | `sermon-01.png` → `sermon-12.png` | `reference-slide-sermon-picker.png` *(original was 5-col grid — not followed; see Sermon Picker section for actual layout)* |
| Outro slide 2 (Showcase) | `showcase-01.png`, `showcase-02.png`, `showcase-03.png` | `reference-slide-outro-showcase.png` |
| Outro slide 3 (Activities) | `outro-symposium.png`, `outro-event.png` | `reference-slide-outro-activities.png` |
| Surveyor home / Thank You / Results | — | *(no reference — original screens, described in text)* |
| All screens (background flavor) | `deco-*.png`, scattered per `reference-bg-scatter-*.png` guidance | |
| Top bar (Home icon) | Inline SVG — no asset file | |
| Sermon picker view toggles | Inline SVG — no asset file | |
| `manifest.json` / install | `icon-192.png`, `icon-512.png` | |

---

## Known Resolved Conflicts (for the record)

An earlier draft of this file and the original brief disagreed with
decisions made during development. This file is authoritative; specifically:

- Topic selection is **exactly 3**, not "1 to 3."
- Orientation is **landscape-locked only**, not portrait+landscape.
- Sermon posters have **no baked-in text** — titles are real bilingual HTML
  text, not part of the image.
- There are **4 intro slides**, and the ECLIPSE title is the first of them,
  not a separate screen before them. The tagline/"心が変われば世界が変わる"
  slide appears only in `outroSlides[0]`, not duplicated into `introSlides`.
- Navigation uses a **single Home icon button**, not a hamburger menu.
