/*
 * PWA wiring — service worker registration + the first-open install prompt.
 * Kept in its own file so the core app files (app.js / navigate.js /
 * screens.js) stay untouched by PWA concerns.
 */

/* ---------- Service worker registration ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.error("[pwa] service worker registration failed:", err);
    });
  });
}

/* ---------- Install prompt ---------- */

// Copy lives here rather than content.js because content.js is the survey
// content file and this is app-shell chrome. Move it into content.js's ui
// object if you'd rather all user-facing strings live in one place.
const PWA_TEXT = {
  EN: {
    title: "Install ECLIPSE",
    androidBody: "Add ECLIPSE to your home screen to use it offline.",
    iosBody: "Tap the Share button, then choose “Add to Home Screen”.",
    install: "Install",
    dismiss: "Not now",
    close: "Got it",
  },
  JP: {
    title: "ECLIPSE をインストール",
    androidBody: "ホーム画面に追加すると、オフラインでも使えます。",
    iosBody: "共有ボタンをタップして「ホーム画面に追加」を選んでください。",
    install: "インストール",
    dismiss: "後で",
    close: "閉じる",
  },
};

const PWA_DISMISS_KEY = "eclipse-install-prompt-dismissed";

function pwaText() {
  // state.language is defined in app.js; fall back to JP (the app's boot
  // language) if this ever runs before app.js has evaluated.
  const lang = typeof state !== "undefined" && state.language ? state.language : "JP";
  return PWA_TEXT[lang] || PWA_TEXT.JP;
}

function isAppInstalled() {
  // display-mode reflects the manifest's "display" value. The manifest uses
  // "standalone", so that's the mode an installed instance reports —
  // "fullscreen" is checked too in case the manifest is ever changed.
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches;

  // iOS Safari doesn't support the display-mode media query the same way and
  // exposes its own flag instead.
  const iosStandalone = window.navigator.standalone === true;

  return standalone || iosStandalone;
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as a Mac; the touch-point check separates it from a
  // real desktop Mac.
  const isIpadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  // Chrome/Firefox/Edge on iOS can't install PWAs, so only real Safari
  // should be shown the Add-to-Home-Screen instructions.
  const isRealSafari = !/crios|fxios|edgios|opios/i.test(ua);

  return (isIos || isIpadOs) && isRealSafari;
}

let deferredInstallPrompt = null;

function buildInstallPopup(mode) {
  const t = pwaText();
  const body = mode === "ios" ? t.iosBody : t.androidBody;

  const overlay = document.createElement("div");
  overlay.className = "pwa-prompt";
  overlay.innerHTML = `
    <div class="pwa-prompt__card">
      <h2 class="pwa-prompt__title">${t.title}</h2>
      <p class="pwa-prompt__body">${body}</p>
      <div class="pwa-prompt__actions">
        ${
          mode === "ios"
            ? `<button class="pwa-prompt__button pwa-prompt__button--primary" data-pwa-action="close">${t.close}</button>`
            : `<button class="pwa-prompt__button" data-pwa-action="dismiss">${t.dismiss}</button>
               <button class="pwa-prompt__button pwa-prompt__button--primary" data-pwa-action="install">${t.install}</button>`
        }
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    const button = e.target.closest("[data-pwa-action]");
    if (!button) return;

    const action = button.dataset.pwaAction;

    if (action === "install" && deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(() => {
        deferredInstallPrompt = null;
        hideInstallPopup();
      });
      return;
    }

    // "Not now" / "Got it" — remember the choice so the surveyor isn't
    // nagged every single time they open the app.
    localStorage.setItem(PWA_DISMISS_KEY, "1");
    hideInstallPopup();
  });

  document.body.appendChild(overlay);
}

function hideInstallPopup() {
  const existing = document.querySelector(".pwa-prompt");
  if (existing) existing.remove();
}

function initInstallPrompt() {
  // Already installed — don't build the popup at all.
  if (isAppInstalled()) return;
  if (localStorage.getItem(PWA_DISMISS_KEY) === "1") return;

  // Android / Chrome: the browser tells us when the app is installable.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!document.querySelector(".pwa-prompt")) buildInstallPopup("android");
  });

  // iOS Safari: beforeinstallprompt never fires, so there's nothing to wait
  // for — detect the platform directly and show manual instructions instead.
  if (isIosSafari()) {
    buildInstallPopup("ios");
  }

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    localStorage.setItem(PWA_DISMISS_KEY, "1");
    hideInstallPopup();
  });
}

initInstallPrompt();
