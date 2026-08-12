let isTransitioning = false;
let currentScreenEl = null;

// The client asked to drop the suicide-stats and mental-illness intro
// slides from the flow entirely (both survey modes). The data stays in
// content.js and the image assets stay in assets/images/ in case they're
// wanted back later — this constant is the only thing that actually
// removes them from navigation, capping the usable slides to the first 2
// (title, who-we-are) regardless of how many entries introSlides has.
const INTRO_SLIDE_COUNT = 2;

function goTo(direction, mutateFn) {
  if (isTransitioning) return;

  const app = document.getElementById("app");
  const oldEl = currentScreenEl;

  mutateFn();

  const temp = document.createElement("div");
  temp.innerHTML = getScreenHTML(state);
  const newEl = temp.firstElementChild;

  if (!oldEl) {
    app.appendChild(newEl);
    currentScreenEl = newEl;
    safeAfterScreenMount();
    return;
  }

  isTransitioning = true;
  app.appendChild(newEl);
  currentScreenEl = newEl;

  const outClass = direction === "forward" ? "screen-anim-out-left" : "screen-anim-out-right";
  const inClass = direction === "forward" ? "screen-anim-in-right" : "screen-anim-in-left";

  oldEl.classList.add(outClass);
  newEl.classList.add(inClass);

  let finished = false;
  function finishTransition() {
    if (finished) return;
    finished = true;
    newEl.classList.remove(inClass);
    if (oldEl.isConnected) oldEl.remove();
    isTransitioning = false;
  }

  newEl.addEventListener("animationend", finishTransition, { once: true });
  // Safety net: a screen transition must never be able to permanently jam
  // navigation, no matter what goes wrong with the animation itself.
  setTimeout(finishTransition, 500);

  safeAfterScreenMount();
}

function safeAfterScreenMount() {
  try {
    afterScreenMount();
  } catch (err) {
    console.error("afterScreenMount failed:", err);
  }
}

const swipeHandlers = {
  home: {
    left: () => {},
    right: () => {},
  },
  intro: {
    left: () => {
      if (state.introSlideIndex < INTRO_SLIDE_COUNT - 1) {
        goTo("forward", () => {
          state.introSlideIndex++;
        });
      } else {
        goTo("forward", () => {
          state.screen = "topicGrid";
        });
      }
    },
    right: () => {
      if (state.introSlideIndex > 0) {
        goTo("back", () => {
          state.introSlideIndex--;
        });
      }
    },
  },
  topicGrid: {
    left: () => {
      if (state.selectedTopics.length !== 3) {
        const t = content[state.language];
        showToast(t.ui.topicsLockToast);
        return;
      }

      if (state.mode === "full") {
        goTo("forward", () => {
          state.screen = "topicMenu";
        });
      } else {
        goTo("forward", () => {
          state.currentTopic = null;
          state.questionIndex = 0;
          state.screen = "questions";
        });
      }
    },
    right: () => {
      goTo("back", () => {
        state.screen = "intro";
        state.introSlideIndex = INTRO_SLIDE_COUNT - 1;
      });
    },
  },
  topicMenu: {
    left: () => {
      const allCompleted = state.selectedTopics.every((topic) =>
        state.completedTopics.includes(topic)
      );
      if (allCompleted) {
        goTo("forward", () => {
          state.screen = "outro";
          state.outroSlideIndex = 0;
        });
      } else {
        const t = content[state.language];
        showToast(t.ui.topicsCompleteLockToast);
      }
    },
    right: () => {
      goTo("back", () => {
        state.completedTopics = [];
        state.screen = "topicGrid";
      });
    },
  },
  questions: {
    left: () => advanceQuestion(),
    right: () => retreatQuestion(),
  },
  sermonPicker: {
    left: () => {
      if (state.selectedSermons.length < 1 || state.selectedSermons.length > 3) {
        const t = content[state.language];
        showToast(t.ui.sermonsLockToast);
        return;
      }
      goTo("forward", () => {
        state.screen = "outro";
        state.outroSlideIndex = 1;
      });
    },
    right: () => {
      goTo("back", () => {
        state.screen = "outro";
        state.outroSlideIndex = 0;
      });
    },
  },
  outro: {
    left: () => {
      if (state.outroSlideIndex === 0) {
        goTo("forward", () => {
          state.screen = "sermonPicker";
        });
      } else if (state.outroSlideIndex === 1) {
        goTo("forward", () => {
          state.outroSlideIndex = 2;
        });
      } else {
        goTo("forward", () => {
          if (!state.resultSaved) {
            saveResult();
            state.resultSaved = true;
          }
          state.screen = "thankYou";
        });
      }
    },
    right: () => {
      if (state.outroSlideIndex === 0) {
        if (state.mode === "full") {
          goTo("back", () => {
            state.screen = "topicMenu";
          });
        } else {
          const t = content[state.language];
          goTo("back", () => {
            state.screen = "questions";
            state.questionIndex = t.quickQuestions.length - 1;
          });
        }
      } else if (state.outroSlideIndex === 1) {
        goTo("back", () => {
          state.screen = "sermonPicker";
        });
      } else {
        goTo("back", () => {
          state.outroSlideIndex = 1;
        });
      }
    },
  },
  thankYou: {
    left: () => {},
    right: () => {
      goTo("back", () => {
        state.screen = "outro";
        state.outroSlideIndex = 2;
      });
    },
  },
  results: {
    left: () => {},
    right: () => {},
  },
};

// A single shared counter, in completion order — derived from state.results
// itself (not a separate variable) so it can never drift out of sync and
// naturally survives Home resets, since state.results does too.
function saveResult() {
  const number = state.results.length + 1;
  const modeLabel = state.mode === "full" ? "Full" : "Quick";

  state.results.push({
    name: `${modeLabel} Survey ${number}`,
    dateTime: new Date().toLocaleString(),
    mode: state.mode,
    topics: [...state.selectedTopics],
    sermons: [...state.selectedSermons],
  });
}

function markTopicCompleted(topic) {
  if (!state.completedTopics.includes(topic)) {
    state.completedTopics.push(topic);
  }
}

function advanceQuestion() {
  const t = content[state.language];

  if (state.mode === "full") {
    const questions = t.questions[state.currentTopic];
    if (state.questionIndex < questions.length - 1) {
      goTo("forward", () => {
        state.questionIndex++;
      });
    } else {
      const topic = state.currentTopic;
      goTo("back", () => {
        markTopicCompleted(topic);
        state.currentTopic = null;
        state.questionIndex = 0;
        state.screen = "topicMenu";
      });
    }
  } else if (state.questionIndex < t.quickQuestions.length - 1) {
    goTo("forward", () => {
      state.questionIndex++;
    });
  } else {
    goTo("forward", () => {
      state.screen = "outro";
      state.outroSlideIndex = 0;
    });
  }
}

function skipCurrentTopic() {
  const topic = state.currentTopic;
  goTo("back", () => {
    markTopicCompleted(topic);
    state.currentTopic = null;
    state.questionIndex = 0;
    state.screen = "topicMenu";
  });
}

function retreatQuestion() {
  if (state.questionIndex > 0) {
    goTo("back", () => {
      state.questionIndex--;
    });
  } else if (state.mode === "full") {
    goTo("back", () => {
      state.currentTopic = null;
      state.screen = "topicMenu";
    });
  } else {
    goTo("back", () => {
      state.screen = "topicGrid";
    });
  }
}

let toastTimeout = null;

function showToast(message) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = message;
  toastEl.classList.add("toast--visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("toast--visible");
  }, 1800);
}

function handleAppClick(e) {
  if (isTransitioning) return;

  const target = e.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "home") {
    resetState();
    goTo("back", () => {
      state.screen = "home";
    });
  } else if (action === "toggle-language") {
    state.language = state.language === "JP" ? "EN" : "JP";
    render();
  } else if (action === "select-mode") {
    const mode = target.dataset.mode;
    goTo("forward", () => {
      state.mode = mode;
      state.screen = "intro";
      state.introSlideIndex = 0;
    });
  } else if (action === "toggle-topic") {
    const topic = target.dataset.topic;
    const idx = state.selectedTopics.indexOf(topic);
    if (idx !== -1) {
      state.selectedTopics.splice(idx, 1);
    } else if (state.selectedTopics.length < 3) {
      state.selectedTopics.push(topic);
    } else {
      return;
    }
    updateTopicPills();
  } else if (action === "select-topic") {
    const topic = target.dataset.topic;
    goTo("forward", () => {
      state.currentTopic = topic;
      state.questionIndex = 0;
      state.screen = "questions";
    });
  } else if (action === "skip-topic") {
    const topic = target.dataset.topic;
    markTopicCompleted(topic);
    updateTopicMenuRow(topic);
  } else if (action === "skip-question") {
    skipCurrentTopic();
  } else if (action === "set-sermon-view") {
    const view = target.dataset.view;
    if (state.sermonView === view) return;
    state.sermonView = view;
    updateSermonView();
  } else if (action === "toggle-sermon") {
    const sermonId = target.dataset.sermon;
    const idx = state.selectedSermons.indexOf(sermonId);
    if (idx !== -1) {
      state.selectedSermons.splice(idx, 1);
    } else if (state.selectedSermons.length < 3) {
      state.selectedSermons.push(sermonId);
    } else {
      return;
    }
    updateSermonSelection();
  } else if (action === "view-results") {
    goTo("forward", () => {
      state.screen = "results";
    });
  } else if (action === "toggle-copy-controls") {
    state.copyControlsVisible = !state.copyControlsVisible;
    render();
  } else if (action === "copy-all") {
    copyAllResults();
  } else if (action === "copy-entry") {
    const index = Number(target.dataset.index);
    copyResultEntry(index);
  }
}

function formatResultEntry(entry) {
  const t = content[state.language];
  const modeLabel = entry.mode === "full" ? t.ui.fullSurveyButton : t.ui.quickSurveyButton;
  const topicsText = entry.topics.map((key) => t.topics[key]).join(", ");
  const sermonsText = entry.sermons.map((key) => t.sermons[key]).join(", ");

  return [
    entry.name,
    entry.dateTime,
    modeLabel,
    `${t.ui.topicsLabel} ${topicsText}`,
    `${t.ui.sermonsLabel} ${sermonsText}`,
  ].join("\n");
}

function copyTextToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const t = content[state.language];
      showToast(t.ui.copyConfirm);
    })
    .catch((err) => {
      console.error("Clipboard write failed:", err);
    });
}

function copyResultEntry(index) {
  const entry = state.results[index];
  if (!entry) return;
  copyTextToClipboard(formatResultEntry(entry));
}

function copyAllResults() {
  const text = state.results.map(formatResultEntry).join("\n\n");
  copyTextToClipboard(text);
}

let swipeStartX = null;
let swipeStartY = null;
let swipeLastY = null;
let swipeAxisLocked = false;
let swipeIsHorizontal = false;
let swipeScrollTarget = null;

const SWIPE_DECISION_THRESHOLD = 10;
const SWIPE_THRESHOLD = 60;

function handlePointerDown(e) {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
  swipeLastY = e.clientY;
  swipeAxisLocked = false;
  swipeIsHorizontal = false;
  // The sermon picker's focused view has touch-action:none (see screens.css)
  // so the browser never natively scrolls it — if the gesture turns out to
  // be vertical, we drive its scrollTop ourselves below instead.
  swipeScrollTarget = e.target.closest(".sermon-grid--focused");
}

// Once a gesture is clearly horizontal, we preventDefault() on every further
// move so the browser never hijacks it for native image-drag. If it's
// vertical and started over the sermon grid, we scroll it manually — see
// handlePointerDown for why native scroll is disabled there.
function handlePointerMove(e) {
  if (swipeStartX === null) return;

  const deltaX = e.clientX - swipeStartX;
  const deltaY = e.clientY - swipeStartY;

  if (!swipeAxisLocked) {
    if (Math.abs(deltaX) < SWIPE_DECISION_THRESHOLD && Math.abs(deltaY) < SWIPE_DECISION_THRESHOLD) {
      return;
    }
    swipeAxisLocked = true;
    swipeIsHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
  }

  if (swipeIsHorizontal) {
    e.preventDefault();
  } else if (swipeScrollTarget) {
    e.preventDefault();
    swipeScrollTarget.scrollTop -= e.clientY - swipeLastY;
    if (typeof updateSermonScrollIndicator === "function") updateSermonScrollIndicator();
  }

  swipeLastY = e.clientY;
}

function handlePointerUp(e) {
  if (swipeStartX === null) return;

  const deltaX = e.clientX - swipeStartX;
  const deltaY = e.clientY - swipeStartY;
  swipeStartX = null;
  swipeStartY = null;
  swipeScrollTarget = null;

  if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

  const handlers = swipeHandlers[state.screen];
  if (!handlers) return;

  if (deltaX < 0) {
    handlers.left && handlers.left();
  } else {
    handlers.right && handlers.right();
  }
}

function handlePointerCancel() {
  swipeStartX = null;
  swipeStartY = null;
  swipeScrollTarget = null;
}

function initNavigation() {
  const toastEl = document.createElement("div");
  toastEl.id = "toast";
  toastEl.className = "toast";
  document.body.appendChild(toastEl);

  document.getElementById("app").addEventListener("click", handleAppClick);
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointermove", handlePointerMove, { passive: false });
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
}

initNavigation();
