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

function updateTopicPills() {
  document.querySelectorAll(".topic-pill").forEach((pill) => {
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
};

function getScreenHTML(state) {
  return screenFunctions[state.screen](state);
}
