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

function screenHome(state) {
  const t = content[state.language];

  return `
    <div class="screen screen-home">
      <div class="top-bar">
        ${homeIconButton()}
        <button class="lang-toggle" data-action="toggle-language">${t.ui.languageToggle}</button>
      </div>
      <div class="home-content">
        <button class="mode-button" data-action="select-mode" data-mode="quick">${t.ui.quickSurveyButton}</button>
        <button class="mode-button" data-action="select-mode" data-mode="full">${t.ui.fullSurveyButton}</button>
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
      <div class="top-bar">${homeIconButton()}</div>
      <div class="topic-grid">${pillsHTML}</div>
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
        <h1>${slide.title}</h1>
        <p class="outro-slide__subtitle">${slide.subtitle}</p>
        <p class="outro-slide__tagline">${slide.tagline.replace(/\n/g, "<br>")}</p>
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
      <div class="top-bar">${homeIconButton()}</div>
      ${slideHTML}
    </div>
  `;
}

function screenThankYou(state) {
  const t = content[state.language];

  return `
    <div class="screen screen-thank-you">
      <div class="top-bar">${homeIconButton()}</div>
      <div class="thank-you-content">
        <h1>${t.ui.endTitle}</h1>
        <p>${t.ui.endBody}</p>
      </div>
    </div>
  `;
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

  if (isFocused) updateSermonScrollIndicator();
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
    updateSermonScrollIndicator();
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
};

function getScreenHTML(state) {
  return screenFunctions[state.screen](state);
}
