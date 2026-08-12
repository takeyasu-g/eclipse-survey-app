let currentScreenEl = null;
// Set while a screen transition is animating; calling it finishes that
// transition immediately. A NEW navigation calls this rather than being
// ignored, so transitions are interruptible instead of swallowing input.
let finishCurrentTransition = null;

// The client asked to drop the suicide-stats and mental-illness intro
// slides from the flow entirely (both survey modes). The data stays in
// content.js and the image assets stay in assets/images/ in case they're
// wanted back later — this constant is the only thing that actually
// removes them from navigation, capping the usable slides to the first 2
// (title, who-we-are) regardless of how many entries introSlides has.
const INTRO_SLIDE_COUNT = 2;

function goTo(direction, mutateFn) {
  // Previously this bailed out entirely while a transition was running, so
  // every tap/swipe during the ~320ms animation was silently dropped — that
  // was the "have to wait a moment before it responds" bug. Instead,
  // fast-forward the in-flight transition to its end state and carry on with
  // the new one, so input is never ignored.
  if (finishCurrentTransition) finishCurrentTransition();

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
    clearTimeout(safetyTimer);
    newEl.classList.remove(inClass);
    if (oldEl.isConnected) oldEl.remove();
    if (finishCurrentTransition === finishTransition) finishCurrentTransition = null;
  }

  finishCurrentTransition = finishTransition;

  newEl.addEventListener("animationend", finishTransition, { once: true });
  // Safety net: a screen transition must never be able to permanently jam
  // navigation, no matter what goes wrong with the animation itself.
  const safetyTimer = setTimeout(finishTransition, 400);

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

// Activation is driven from pointerup (see handlePointerUp), NOT from the
// browser's synthesised click. `click` is only kept as a fallback for input
// methods that never produce our pointer sequence (keyboard/assistive tech).
function handleAppClick(e) {
  // Swallow the click that a completed swipe leaves behind (see
  // handlePointerUp), so swiping can't also press whatever was under the
  // finger. Reset on the next pointerdown, not here, because a swipe that
  // detaches its target may not emit a click at all.
  if (swipeDidNavigate) return;

  // Already handled on pointerup — don't run it twice.
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }

  const target = e.target.closest("[data-action]");
  if (!target) return;
  performAction(target);
}

function performAction(target) {
  // This used to be a blanket `if (isTransitioning) return;`, which dropped
  // EVERY tap for the duration of a screen animation — including legitimate
  // taps on the new screen, which is already live and interactive. The real
  // goal was only to ignore input landing on the outgoing screen, so check
  // that directly: anything inside the current screen is fair game.
  if (currentScreenEl && !currentScreenEl.contains(target)) return;

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
let swipeDidNavigate = false;
let suppressNextClick = false;

const SWIPE_DECISION_THRESHOLD = 10;
const SWIPE_THRESHOLD = 60;
// How much finger drift still counts as a tap rather than a drag. Generous,
// because a real finger always moves a little on a button press.
const TAP_SLOP = 16;

// The sermon grid is scrolled manually (native touch scrolling is disabled
// there so it can't steal the left/right navigation swipe). A raw 1:1
// mapping felt sluggish on a real phone, because one row is nearly a full
// screen tall — so a whole drag barely advanced a single row. This
// multiplier makes each drag travel further.
const SERMON_SCROLL_SPEED = 2.4;

function handlePointerDown(e) {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
  swipeLastY = e.clientY;
  swipeAxisLocked = false;
  swipeIsHorizontal = false;
  swipeDidNavigate = false;
  suppressNextClick = false;
  // The sermon picker's focused view has touch-action:none (see screens.css)
  // so the browser never natively scrolls it — if the gesture turns out to
  // be vertical, we drive its scrollTop ourselves below instead.
  swipeScrollTarget = e.target.closest(".sermon-grid--focused");
}

// NOTE: this deliberately does NOT call preventDefault().
//
// It used to, as soon as the gesture axis-locked (only 10px of movement).
// Calling preventDefault() on a touch-derived pointermove suppresses the
// browser's follow-up `click` event — and a real finger tap almost always
// drifts a few pixels, so taps that drifted past 10px horizontally silently
// produced no click at all. That was the "first tap does nothing, second
// tap works" bug.
//
// preventDefault() was never needed here anyway: gesture ownership is
// already declared in CSS. #app has touch-action:pan-y (no native
// horizontal panning) and .sermon-grid--focused has touch-action:none (no
// native scrolling, we drive scrollTop ourselves). Text selection and image
// dragging are blocked by user-select:none / -webkit-user-drag:none.
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

  if (!swipeIsHorizontal && swipeScrollTarget) {
    swipeScrollTarget.scrollTop -= (e.clientY - swipeLastY) * SERMON_SCROLL_SPEED;
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

  const isSwipe = Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) >= Math.abs(deltaY);

  if (!isSwipe) {
    // Treat a low-movement gesture as a tap and act on it NOW, rather than
    // waiting for the browser's synthesised click. The click that follows can
    // be delayed (gesture disambiguation, main-thread work from rendering the
    // new screen), which is what made buttons feel dead for a moment after
    // navigating. pointerup fires the instant the finger lifts.
    if (Math.abs(deltaX) < TAP_SLOP && Math.abs(deltaY) < TAP_SLOP) {
      // Touch uses implicit pointer capture, so e.target here is the element
      // the press STARTED on — which is the correct tap semantics anyway.
      const target = e.target.closest && e.target.closest("[data-action]");
      if (target) {
        suppressNextClick = true;
        performAction(target);
      }
    }
    return;
  }

  const handlers = swipeHandlers[state.screen];
  if (!handlers) return;

  // Now that we no longer preventDefault(), a completed swipe still emits a
  // click on whatever was under the finger. Flag it so handleAppClick can
  // swallow that one click and a swipe can't accidentally press a button.
  swipeDidNavigate = true;

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
  // passive:true — this handler must never preventDefault(), because doing
  // so suppresses the follow-up click and breaks taps (see handlePointerMove).
  // Marking it passive makes the browser reject any future attempt to.
  document.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
}

initNavigation();
