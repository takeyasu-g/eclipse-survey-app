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

function render() {
  const app = document.getElementById("app");
  const screenFunctions = {
    home: screenHome,
  };

  const screenFn = screenFunctions[state.screen];
  app.innerHTML = screenFn(state);
}

render();
