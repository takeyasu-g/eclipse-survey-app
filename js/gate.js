/*
 * Install gate + PWA bootstrap.
 *
 * The real app is only reachable when running installed. Rather than
 * rendering the app and hiding it, the app's scripts are not loaded at all
 * in a plain browser tab — so there is nothing to bypass by fiddling with
 * CSS or the DOM. index.html therefore loads ONLY this file; the app's own
 * scripts are injected below once the installed check passes.
 */

const APP_SCRIPTS = [
  "js/content.js",
  "js/screens.js",
  "js/navigate.js",
  "js/app.js",
];

/* ---------- Service worker ---------- */

// Registered in BOTH cases (gated and installed): Chrome requires an active
// service worker with a fetch handler before it will consider the app
// installable, so the gate page needs it too or the install button never
// becomes usable.
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch((err) => {
    console.error("[gate] service worker registration failed:", err);
  });
}

/* ---------- Environment checks ---------- */

function isInstalled() {
  // The manifest uses display:"fullscreen", so an installed instance reports
  // fullscreen — but standalone is checked too, both because the manifest
  // may change and because some launchers fall back to standalone.
  return (
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// True only for actual Google Chrome. Plenty of Android browsers put
// "Chrome/" in their UA string (Edge, Samsung Internet, Opera, Brave, UC,
// Yandex), so those have to be excluded explicitly or they'd be given
// Chrome-specific menu wording that doesn't match their UI.
function isChromeBrowser() {
  const ua = window.navigator.userAgent;
  const claimsChrome = /chrome\//i.test(ua);
  const isOtherBrowser = /edga?\/|edg\/|samsungbrowser|opr\/|opera|ucbrowser|yabrowser|brave|firefox|fxios/i.test(
    ua
  );
  return claimsChrome && !isOtherBrowser;
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ identifies as a Mac; the touch-point count separates it from
  // an actual desktop Mac.
  const isIpadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  // Chrome/Firefox/Edge on iOS cannot install PWAs at all, so only real
  // Safari should be given Add-to-Home-Screen instructions.
  const isRealSafari = !/crios|fxios|edgios|opios/i.test(ua);
  return (isIos || isIpadOs) && isRealSafari;
}

/* ---------- Booting the real app ---------- */

function loadAppScripts() {
  // Loaded sequentially: the app's files are plain scripts sharing globals
  // (content -> screens -> navigate -> app), and app.js calls render() at
  // evaluation time, so order matters and async loading would break it.
  APP_SCRIPTS.reduce(
    (chain, src) =>
      chain.then(
        () =>
          new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`failed to load ${src}`));
            document.body.appendChild(script);
          })
      ),
    Promise.resolve()
  ).catch((err) => console.error("[gate]", err));
}

/* ---------- Gate page ---------- */

// The gate runs before content.js is loaded, so it can't use the app's
// bilingual content. Both languages are shown together instead of guessing
// or adding a language toggle to a page users should only ever see once.
const GATE_TEXT = {
  headline: {
    jp: "このアプリはインストールが必要です",
    en: "This app must be installed to use",
  },
  androidBody: {
    jp: "下のボタンからホーム画面に追加してください。",
    en: "Add it to your home screen using the button below.",
  },
  iosBody: {
    jp: "共有ボタンをタップして「ホーム画面に追加」を選んでください。",
    en: "Tap the Share icon, then choose “Add to Home Screen”.",
  },
  installButton: {
    jp: "インストール",
    en: "Install",
  },
  // Chrome-specific wording, used only when we're confident it's real Chrome.
  manualHelpChrome: {
    jp: "ボタンが動作しない場合は、右上の「⋮」メニューから「アプリをインストール」を選んでください。",
    en: "If the button does nothing, open the ⋮ menu (top right) and choose “Install app”.",
  },
  // Deliberately generic for every other Android browser (Samsung Internet,
  // Firefox, Edge, …) — their menus differ and are not worth enumerating.
  manualHelpGeneric: {
    jp: "ブラウザのメニューを開き、「アプリをインストール」または「ホーム画面に追加」を探してください。",
    en: "Open your browser's menu and look for “Install app” or “Add to Home Screen”.",
  },
  reopenNote: {
    jp: "インストール後は、ホーム画面のアイコンから開いてください。",
    en: "Once installed, open it from the home screen icon.",
  },
};

let deferredInstallPrompt = null;

function line(key) {
  return `
    <p class="gate__line">
      <span class="gate__jp">${GATE_TEXT[key].jp}</span>
      <span class="gate__en">${GATE_TEXT[key].en}</span>
    </p>
  `;
}

function renderGate() {
  const ios = isIosSafari();

  document.body.innerHTML = `
    <div class="gate">
      <div class="gate__card">
        <h1 class="gate__brand">ECLIPSE</h1>
        ${line("headline")}
        ${ios ? line("iosBody") : line("androidBody")}
        ${
          ios
            ? ""
            : `<button class="gate__button" id="gate-install">${GATE_TEXT.installButton.jp} / ${GATE_TEXT.installButton.en}</button>`
        }
        <div class="gate__help ${ios ? "" : "gate__help--hidden"}" id="gate-help">
          ${ios ? "" : line(isChromeBrowser() ? "manualHelpChrome" : "manualHelpGeneric")}
          ${line("reopenNote")}
        </div>
      </div>
    </div>
  `;

  const button = document.getElementById("gate-install");
  if (!button) return;

  button.addEventListener("click", () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(() => {
        // Chrome only ever fires beforeinstallprompt once per page load and
        // won't refire it after a dismissal, so the captured prompt is spent
        // here. The button stays visible and falls back to the manual
        // instructions from this point on.
        deferredInstallPrompt = null;
        revealHelp();
      });
      return;
    }

    // No captured prompt (dismissed earlier, already-installed-then-removed,
    // or a browser that never fires the event) — the button must still do
    // something useful, so surface the manual route.
    revealHelp();
  });
}

function revealHelp() {
  const help = document.getElementById("gate-help");
  if (help) help.classList.remove("gate__help--hidden");
}

/* ---------- Entry point ---------- */

// Registered before anything else so the event isn't missed while rendering.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  revealHelp();
});

registerServiceWorker();

if (isInstalled()) {
  loadAppScripts();
} else {
  renderGate();
}
