function homeIconButton() {
  return `
    <button class="icon-button home-button" data-action="home" aria-label="Home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    </button>
  `;
}

function sermonFocusedIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="4" height="16" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="17" y="4" width="4" height="16" rx="1" />
    </svg>
  `;
}

function sermonGridIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  `;
}

function pencilIcon() {
  return `
    <svg class="result-entry__edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  `;
}

// Only cloud, star, block — no eraser. Cloud is both heavily weighted
// (via repeated "cloud" entries below) and sized much larger than star/block.
const DECO_ICON_CONFIG = [
  { icon: "cloud", file: "deco-cloud.png", weight: 6, sizeMin: 165, sizeMax: 285 },
  { icon: "star", file: "deco-star.png", weight: 1, sizeMin: 28, sizeMax: 48 },
  { icon: "block", file: "deco-block.png", weight: 1, sizeMin: 28, sizeMax: 48 },
];

const DECO_ICON_POOL = DECO_ICON_CONFIG.flatMap((cfg) => Array(cfg.weight).fill(cfg));

// Peripheral corner/edge zones only — deliberately avoids the center of the
// screen, where every screen's actual interactive content lives.
const DECO_ZONES = [
  { top: [4, 13], left: [3, 12] },
  { top: [4, 13], left: [80, 92] },
  { top: [76, 88], left: [3, 12] },
  { top: [76, 88], left: [80, 92] },
  { top: [4, 10], left: [42, 55] },
  { top: [84, 90], left: [42, 55] },
];

function decorativeScatterHTML(count = 5) {
  const zones = [...DECO_ZONES].sort(() => Math.random() - 0.5).slice(0, count);

  const iconsHTML = zones
    .map((zone) => {
      const cfg = DECO_ICON_POOL[Math.floor(Math.random() * DECO_ICON_POOL.length)];
      const top = zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]);
      const left = zone.left[0] + Math.random() * (zone.left[1] - zone.left[0]);
      const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);
      const rotate = Math.random() * 36 - 18;

      return `<img class="deco-icon" src="assets/icons/${cfg.file}" alt="" style="top:${top.toFixed(1)}%; left:${left.toFixed(1)}%; width:${size.toFixed(0)}px; transform: rotate(${rotate.toFixed(0)}deg);" />`;
    })
    .join("");

  return `<div class="deco-layer">${iconsHTML}</div>`;
}

// Home screen title. Kept local rather than in content.js because this
// phase is styling-only and content.js is frozen — move it into
// content.js's ui object later if you'd rather it live with the rest of
// the copy. "調査" matches the wording already used by
// quickSurveyButton / fullSurveyButton.
const HOME_TITLE = {
  EN: "ECLIPSE Survey",
  JP: "ECLIPSE 調査",
};

function screenHome(state) {
  const t = content[state.language];

  return `
    <div class="screen screen-home">
      ${decorativeScatterHTML()}
      <div class="top-bar">
        <button class="lang-toggle" data-action="toggle-language">${t.ui.languageToggle}</button>
      </div>
      <div class="home-content">
        <h1 class="home-title">${HOME_TITLE[state.language]}</h1>
        <div class="home-mode-row">
          <button class="mode-button" data-action="select-mode" data-mode="quick">${t.ui.quickSurveyButton}</button>
          <button class="mode-button" data-action="select-mode" data-mode="full">${t.ui.fullSurveyButton}</button>
        </div>
        <button class="results-button" data-action="view-results">${t.ui.resultsButton}</button>
      </div>
    </div>
  `;
}

function screenIntro(state) {
  const t = content[state.language];
  const slide = t.introSlides[state.introSlideIndex];

  let slideHTML = "";

  if (slide.type === "title") {
    slideHTML = `
      <div class="intro-slide intro-slide--title">
        <div class="intro-slide__text">
          <h1>${slide.title}</h1>
          <p class="intro-slide__tagline">${slide.tagline.replace(/\n/g, "<br>")}</p>
        </div>
        <img class="intro-slide__title-art" src="assets/icons/deco-bulb-book-abc.png" alt="" draggable="false" />
      </div>
    `;
  } else if (slide.type === "whoAreWe") {
    slideHTML = `
      <div class="intro-slide intro-slide--who">
        <img class="intro-slide__image" src="assets/images/intro-whoarewe.png" alt="" />
        <div class="intro-slide__text">
          <h1>${slide.title}</h1>
          <p>${slide.body.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    `;
  } else if (slide.type === "suicideStats") {
    const statsHTML = slide.stats
      .map(
        (s) => `
          <div class="stat-ring">
            <span class="stat-ring__percent">${s.percent}</span>
            <p class="stat-ring__label">${s.label.replace(/\n/g, "<br>")}</p>
          </div>
        `
      )
      .join("");

    slideHTML = `
      <div class="intro-slide intro-slide--stats">
        <img class="intro-slide__image" src="assets/images/intro-stats.png" alt="" />
        <div class="intro-slide__text">
          <h2>${slide.title}</h2>
          <p class="intro-slide__caption">${slide.caption.replace(/\n/g, "<br>")}</p>
          <div class="stat-ring-group">${statsHTML}</div>
          <p class="intro-slide__source">${slide.source}</p>
        </div>
      </div>
    `;
  } else if (slide.type === "mentalIllness") {
    slideHTML = `
      <div class="intro-slide intro-slide--mental">
        <img class="intro-slide__image" src="assets/images/intro-mentalhealth.png" alt="" />
        <p class="intro-slide__body">${slide.body.replace(/\n/g, "<br>")}</p>
      </div>
    `;
  }

  return `
    <div class="screen screen-intro">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      ${slideHTML}
    </div>
  `;
}

function screenTopicGrid(state) {
  const t = content[state.language];
  const topics = topicsByMode[state.mode];

  const pillsHTML = topics
    .map((topic) => {
      const isSelected = state.selectedTopics.includes(topic);
      const isFaded = !isSelected && state.selectedTopics.length === 3;
      const classes = ["topic-pill"];
      if (isSelected) classes.push("topic-pill--selected");
      if (isFaded) classes.push("topic-pill--faded");

      return `<button class="${classes.join(" ")}" data-action="toggle-topic" data-topic="${topic}">${t.topics[topic]}</button>`;
    })
    .join("");

  return `
    <div class="screen screen-topic-grid">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      <p class="topic-grid-prompt">${t.ui.topicGridPrompt}</p>
      <div class="topic-grid-area">
        <div class="topic-grid">${pillsHTML}</div>
      </div>
    </div>
  `;
}

function screenTopicMenu(state) {
  const t = content[state.language];
  const orderedTopics = topicsByMode[state.mode].filter((topic) =>
    state.selectedTopics.includes(topic)
  );

  const rowsHTML = orderedTopics
    .map((topic) => {
      const isCompleted = state.completedTopics.includes(topic);
      const classes = ["topic-menu-row"];
      if (isCompleted) classes.push("topic-menu-row--completed");

      return `
        <div class="${classes.join(" ")}" data-topic="${topic}">
          <button class="topic-menu-button" data-action="select-topic" data-topic="${topic}">${t.topics[topic]}</button>
          <button class="topic-menu-skip" data-action="skip-topic" data-topic="${topic}">${t.ui.skipButton}</button>
        </div>
      `;
    })
    .join("");

  return `
    <div class="screen screen-topic-menu">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      <div class="topic-menu-list">${rowsHTML}</div>
    </div>
  `;
}

function screenQuestions(state) {
  const t = content[state.language];
  const isFull = state.mode === "full";

  let questionText;
  let topicPillHTML = "";
  let examplesHTML = "";

  if (isFull) {
    const questions = t.questions[state.currentTopic];
    questionText = questions[state.questionIndex];
    topicPillHTML = `<div class="question-topic-pill">${t.topics[state.currentTopic]}</div>`;
  } else {
    const q = t.quickQuestions[state.questionIndex];
    questionText = q.text;
    if (q.examples) {
      examplesHTML = `
        <ul class="question-examples">
          ${q.examples.map((ex) => `<li>${ex}</li>`).join("")}
        </ul>
      `;
    }
  }

  const skipHTML = isFull
    ? `<button class="question-skip" data-action="skip-question">${t.ui.skipTopicButton}</button>`
    : "";

  return `
    <div class="screen screen-questions">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      ${topicPillHTML}
      <div class="question-body">
        <p class="question-text">${questionText}</p>
        ${examplesHTML}
      </div>
      ${skipHTML}
    </div>
  `;
}

function screenSermonPicker(state) {
  const t = content[state.language];

  const postersHTML = sermons
    .map((sermon) => {
      const isSelected = state.selectedSermons.includes(sermon.id);
      const classes = ["sermon-poster"];
      if (isSelected) classes.push("sermon-poster--selected");

      return `
        <button class="${classes.join(" ")}" data-action="toggle-sermon" data-sermon="${sermon.id}">
          <span class="sermon-poster__image-wrap">
            <img src="assets/images/${sermon.image}" alt="" draggable="false" />
          </span>
          <span class="sermon-poster__title">${t.sermons[sermon.id]}</span>
        </button>
      `;
    })
    .join("");

  const isFocused = state.sermonView === "focused";
  const viewClass = isFocused ? "sermon-grid--focused" : "sermon-grid--grid";
  const indicatorHiddenClass = isFocused ? "" : "sermon-scroll-indicator--hidden";

  return `
    <div class="screen screen-sermon-picker">
      ${decorativeScatterHTML()}
      <div class="top-bar">
        ${homeIconButton()}
        <div class="sermon-view-toggles">
          <button class="icon-button view-toggle ${isFocused ? "view-toggle--active" : ""}" data-action="set-sermon-view" data-view="focused" aria-label="Focused view">
            ${sermonFocusedIcon()}
          </button>
          <button class="icon-button view-toggle ${!isFocused ? "view-toggle--active" : ""}" data-action="set-sermon-view" data-view="grid" aria-label="Grid view">
            ${sermonGridIcon()}
          </button>
        </div>
      </div>
      <div class="sermon-grid-area">
        <div class="sermon-grid ${viewClass}" onscroll="updateSermonScrollIndicator()">${postersHTML}</div>
        <div class="sermon-scroll-indicator ${indicatorHiddenClass}">
          <div class="sermon-scroll-indicator__thumb"></div>
        </div>
      </div>
    </div>
  `;
}

function screenOutro(state) {
  const t = content[state.language];
  const slide = t.outroSlides[state.outroSlideIndex];

  let slideHTML = "";

  if (slide.type === "closer") {
    slideHTML = `
      <div class="outro-slide outro-slide--closer">
        <img class="outro-slide__closer-art" src="assets/icons/deco-pencil-book.png" alt="" draggable="false" />
        <h1>${slide.title}</h1>
        <p class="outro-slide__tagline">${slide.tagline.replace(/\n/g, "<br>")}</p>
        <p class="outro-slide__subtitle">&ldquo;${slide.subtitle}&rdquo;</p>
      </div>
    `;
  } else if (slide.type === "showcase") {
    slideHTML = `
      <div class="outro-slide outro-slide--showcase">
        <h1>${slide.title}</h1>
        <div class="showcase-row">
          <img src="assets/images/showcase-01.png" alt="" />
          <img src="assets/images/showcase-02.png" alt="" />
          <img src="assets/images/showcase-03.png" alt="" />
        </div>
      </div>
    `;
  } else if (slide.type === "activities") {
    slideHTML = `
      <div class="outro-slide outro-slide--activities">
        <h1>${slide.title}</h1>
        <div class="activities-row">
          <div class="activities-item">
            <img src="assets/images/outro-symposium.png" alt="" />
            <p>${slide.items[0].label}</p>
          </div>
          <div class="activities-item">
            <img src="assets/images/outro-event.png" alt="" />
            <p>${slide.items[1].label}</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="screen screen-outro">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      ${slideHTML}
    </div>
  `;
}

function screenThankYou(state) {
  const t = content[state.language];

  return `
    <div class="screen screen-thank-you">
      ${decorativeScatterHTML()}
      <div class="top-bar">${homeIconButton()}</div>
      <div class="thank-you-content">
        <h1>${t.ui.endTitle}</h1>
        <p>${t.ui.endBody}</p>
      </div>
      <img class="thank-you-art" src="assets/icons/deco-bulb.png" alt="" draggable="false" />
    </div>
  `;
}

function screenResults(state) {
  const t = content[state.language];
  const copyVisible = state.copyControlsVisible;

  let bodyHTML;
  if (state.results.length === 0) {
    bodyHTML = `<p class="results-empty">${t.ui.resultsEmpty}</p>`;
  } else {
    const entriesHTML = state.results
      .map((entry, i) => {
        const topicsText = entry.topics.map((key) => t.topics[key]).join(", ");
        const sermonsText = entry.sermons.map((key) => t.sermons[key]).join(", ");

        const copyButtonHTML = copyVisible
          ? `<button class="result-entry__copy" data-action="copy-entry" data-index="${i}">${t.ui.copyButton}</button>`
          : "";

        return `
          <div class="result-entry">
            <div class="result-entry__header">
              <span class="result-entry__name-wrap">
                <span
                  class="result-entry__name"
                  contenteditable="true"
                  spellcheck="false"
                  onblur="commitResultName(this, ${i})"
                  onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
                >${entry.name}</span>
                ${pencilIcon()}
              </span>
              ${copyButtonHTML}
            </div>
            <p class="result-entry__datetime">${entry.dateTime}</p>
            <p class="result-entry__meta">${t.ui.topicsLabel} ${topicsText}</p>
            <p class="result-entry__meta">${t.ui.sermonsLabel} ${sermonsText}</p>
          </div>
        `;
      })
      .join("");

    bodyHTML = `<div class="results-list">${entriesHTML}</div>`;
  }

  const copyAllHTML = copyVisible
    ? `<button class="copy-all-button" data-action="copy-all">${t.ui.copyAllButton}</button>`
    : "";

  return `
    <div class="screen screen-results">
      ${decorativeScatterHTML()}
      <div class="top-bar">
        ${homeIconButton()}
        <div class="results-top-actions">
          ${copyAllHTML}
          <button class="copy-toggle ${copyVisible ? "active" : ""}" data-action="toggle-copy-controls">${t.ui.copyButton}</button>
        </div>
      </div>
      <h1 class="results-title">${t.ui.resultsTitle}</h1>
      ${bodyHTML}
    </div>
  `;
}

function commitResultName(el, index) {
  const newName = el.textContent.trim();
  const entry = state.results[index];
  if (entry && newName) {
    entry.name = newName;
  } else if (entry) {
    el.textContent = entry.name;
  }
}

function updateSermonView() {
  if (!currentScreenEl) return;

  const isFocused = state.sermonView === "focused";

  const grid = currentScreenEl.querySelector(".sermon-grid");
  if (grid) {
    grid.classList.toggle("sermon-grid--focused", isFocused);
    grid.classList.toggle("sermon-grid--grid", !isFocused);
  }

  currentScreenEl.querySelectorAll(".view-toggle").forEach((btn) => {
    btn.classList.toggle("view-toggle--active", btn.dataset.view === state.sermonView);
  });

  const indicator = currentScreenEl.querySelector(".sermon-scroll-indicator");
  if (indicator) indicator.classList.toggle("sermon-scroll-indicator--hidden", !isFocused);

  sizeSermonPosters();
  if (isFocused) updateSermonScrollIndicator();
}

// Computes poster size explicitly from real measured space instead of
// relying on CSS aspect-ratio + flex-grow + max-width, which kept
// resolving inconsistently (posters either overflowing the viewport or
// leaving dead space) across different available heights. Focused view
// must show ~1 row within the visible area; grid view must fit both rows
// with zero scroll — both computed the same way, just with different
// column/row counts.
// Only focused view needs this. Grid view sizes itself purely in CSS now —
// every cell is identical by construction (equal 1fr columns/rows), the
// title is hard-capped to 2 lines (a fixed, known height), and the poster
// image takes flex:1 (whatever's left), which can't overflow its cell by
// definition. That's simpler and more robust than computing/measuring a
// width for it here ever was.
function sizeSermonPosters() {
  if (!currentScreenEl) return;

  const grid = currentScreenEl.querySelector(".sermon-grid--focused");
  if (!grid) return;

  const columns = 3;
  const rows = 1;
  const gap = 10;

  const areaWidth = grid.clientWidth;
  const areaHeight = grid.clientHeight;
  if (areaWidth <= 0 || areaHeight <= 0) return;

  // How tall CJK titles actually wrap to depends on font size, column
  // width, and string length all at once — too unpredictable to guess a
  // fixed allowance for. The title's width is already fixed at 100% of its
  // column by CSS regardless of --sermon-poster-width, so measuring its
  // real rendered height here is accurate before we've even computed the
  // poster width.
  let maxTitleHeight = 0;
  grid.querySelectorAll(".sermon-poster__title").forEach((title) => {
    maxTitleHeight = Math.max(maxTitleHeight, title.offsetHeight);
  });
  const titleGap = 6; // matches .sermon-poster's own gap
  const titleAllowance = maxTitleHeight > 0 ? maxTitleHeight + titleGap : 110;

  const columnWidth = (areaWidth - gap * (columns - 1)) / columns;
  const rowHeight = (areaHeight - gap * (rows - 1)) / rows;
  const widthFromHeight = (rowHeight - titleAllowance) * (2 / 3);

  const posterWidth = Math.max(20, Math.min(columnWidth, widthFromHeight));
  grid.style.setProperty("--sermon-poster-width", `${posterWidth}px`);
}

function updateSermonSelection() {
  if (!currentScreenEl) return;
  currentScreenEl.querySelectorAll(".sermon-poster").forEach((poster) => {
    const isSelected = state.selectedSermons.includes(poster.dataset.sermon);
    poster.classList.toggle("sermon-poster--selected", isSelected);
  });
}

// The scroll thumb's size/position is derived from the grid's real scroll
// metrics, not a guess — always accurate regardless of device height.
function updateSermonScrollIndicator() {
  if (!currentScreenEl) return;

  const grid = currentScreenEl.querySelector(".sermon-grid--focused");
  const thumb = currentScreenEl.querySelector(".sermon-scroll-indicator__thumb");
  if (!grid || !thumb) return;

  const { scrollTop, scrollHeight, clientHeight } = grid;
  if (scrollHeight <= 0) return;

  const thumbHeightPct = Math.max((clientHeight / scrollHeight) * 100, 10);
  const maxScroll = scrollHeight - clientHeight;
  const scrollPct = maxScroll > 0 ? (scrollTop / maxScroll) * (100 - thumbHeightPct) : 0;

  thumb.style.height = `${thumbHeightPct}%`;
  thumb.style.top = `${scrollPct}%`;
}

function afterScreenMount() {
  if (state.screen === "sermonPicker") {
    sizeSermonPosters();
    updateSermonScrollIndicator();

    // Titles use a custom web font (Potta One). If it hasn't finished
    // loading yet, the browser measures the fallback font's wrapped
    // height instead — wrong, since Potta One wraps CJK text differently —
    // so re-measure once the real font is confirmed loaded.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        sizeSermonPosters();
        updateSermonScrollIndicator();
      });
    }
  }
}

function updateTopicMenuRow(topic) {
  if (!currentScreenEl) return;
  const row = currentScreenEl.querySelector(`.topic-menu-row[data-topic="${topic}"]`);
  if (row) row.classList.add("topic-menu-row--completed");
}

function updateTopicPills() {
  if (!currentScreenEl) return;
  currentScreenEl.querySelectorAll(".topic-pill").forEach((pill) => {
    const isSelected = state.selectedTopics.includes(pill.dataset.topic);
    const isFaded = !isSelected && state.selectedTopics.length === 3;
    pill.classList.toggle("topic-pill--selected", isSelected);
    pill.classList.toggle("topic-pill--faded", isFaded);
  });
}

const screenFunctions = {
  home: screenHome,
  intro: screenIntro,
  topicGrid: screenTopicGrid,
  topicMenu: screenTopicMenu,
  questions: screenQuestions,
  sermonPicker: screenSermonPicker,
  outro: screenOutro,
  thankYou: screenThankYou,
  results: screenResults,
};

function getScreenHTML(state) {
  return screenFunctions[state.screen](state);
}
