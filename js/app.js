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
  resultSaved: false,      // guards against a duplicate save if the user swipes back and forth into Thank You again
  copyControlsVisible: false, // results screen — whether Copy/Copy All buttons are shown
};

function render() {
  const app = document.getElementById("app");
  app.innerHTML = getScreenHTML(state);
  currentScreenEl = app.firstElementChild;
  safeAfterScreenMount();
}

function resetState() {
  state.mode = null;
  state.selectedTopics = [];
  state.completedTopics = [];
  state.selectedSermons = [];
  state.sermonView = "focused";
  state.introSlideIndex = 0;
  state.outroSlideIndex = 0;
  state.questionIndex = 0;
  state.currentTopic = null;
  state.resultSaved = false;
  state.copyControlsVisible = false;
}

render();
