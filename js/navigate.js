let isTransitioning = false;

function goTo(direction, mutateFn) {
  if (isTransitioning) return;

  const app = document.getElementById("app");
  const oldEl = app.firstElementChild;

  if (!oldEl) {
    mutateFn();
    render();
    return;
  }

  isTransitioning = true;
  mutateFn();

  const temp = document.createElement("div");
  temp.innerHTML = getScreenHTML(state);
  const newEl = temp.firstElementChild;
  app.appendChild(newEl);

  const outClass = direction === "forward" ? "screen-anim-out-left" : "screen-anim-out-right";
  const inClass = direction === "forward" ? "screen-anim-in-right" : "screen-anim-in-left";

  oldEl.classList.add(outClass);
  newEl.classList.add(inClass);

  newEl.addEventListener(
    "animationend",
    () => {
      newEl.classList.remove(inClass);
      oldEl.remove();
      isTransitioning = false;
    },
    { once: true }
  );
}

const swipeHandlers = {
  home: {
    left: () => {},
    right: () => {},
  },
  intro: {
    left: () => {
      const t = content[state.language];
      if (state.introSlideIndex < t.introSlides.length - 1) {
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
      if (state.selectedTopics.length === 3) {
        // Next screen (3-topic menu / questions) isn't built yet — no-op for now.
      } else {
        const t = content[state.language];
        showToast(t.ui.topicsLockToast);
      }
    },
    right: () => {
      const t = content[state.language];
      goTo("back", () => {
        state.screen = "intro";
        state.introSlideIndex = t.introSlides.length - 1;
      });
    },
  },
};

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
  }
}

let swipeStartX = null;
let swipeStartY = null;

function handlePointerDown(e) {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
}

function handlePointerUp(e) {
  if (swipeStartX === null) return;

  const deltaX = e.clientX - swipeStartX;
  const deltaY = e.clientY - swipeStartY;
  swipeStartX = null;
  swipeStartY = null;

  const SWIPE_THRESHOLD = 60;
  if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

  const handlers = swipeHandlers[state.screen];
  if (!handlers) return;

  if (deltaX < 0) {
    handlers.left && handlers.left();
  } else {
    handlers.right && handlers.right();
  }
}

function initNavigation() {
  const toastEl = document.createElement("div");
  toastEl.id = "toast";
  toastEl.className = "toast";
  document.body.appendChild(toastEl);

  document.getElementById("app").addEventListener("click", handleAppClick);
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointerup", handlePointerUp);
}

initNavigation();
