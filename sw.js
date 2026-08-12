/*
 * ECLIPSE service worker — full offline support after first load.
 *
 * CACHE VERSIONING — HOW TO PUSH AN UPDATE TO USERS:
 * Bump the version number in CACHE_NAME below (v1 -> v2 -> ...) whenever you
 * change ANY file in PRECACHE_URLS. The activate handler deletes every cache
 * whose name doesn't match the current CACHE_NAME, so a new version string
 * throws away the entire old cache and re-downloads everything fresh.
 * If you DON'T bump it, returning users keep being served the old cached
 * files forever and will never see your changes.
 */
const CACHE_NAME = "eclipse-cache-v7";

/*
 * Paths are relative ("./...") on purpose — this app is served from a
 * GitHub Pages project subpath (/eclipse-survey-app/), not a domain root,
 * so absolute "/..." paths would resolve to the wrong place.
 *
 * FONTS: only the weights the CSS actually uses are precached. main.css
 * declares seven @font-face weights for M PLUS Rounded 1c, but only 400
 * (body) and 700 (headings/buttons) are ever applied — precaching all seven
 * would download ~24MB instead of ~7MB, on a phone, over mobile data. If you
 * ever start using another weight in CSS, add its .ttf here too.
 *
 * assets/reference/ is deliberately NOT cached — those files are dev-only
 * visual references and are never requested by the running app.
 */
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",

  "./css/main.css",
  "./css/screens.css",
  "./css/animations.css",
  "./css/gate.css",

  "./js/gate.js",
  "./js/content.js",
  "./js/screens.js",
  "./js/navigate.js",
  "./js/app.js",

  "./assets/fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Regular.ttf",
  "./assets/fonts/M_PLUS_Rounded_1c/MPLUSRounded1c-Bold.ttf",
  "./assets/fonts/Potta_One/PottaOne-Regular.ttf",

  "./assets/icons/deco-block.png",
  "./assets/icons/deco-bulb-book-abc.png",
  "./assets/icons/deco-bulb.png",
  "./assets/icons/deco-cloud.png",
  "./assets/icons/deco-eraser.png",
  "./assets/icons/deco-pencil-book.png",
  "./assets/icons/deco-star.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",

  "./assets/images/intro-whoarewe.png",
  "./assets/images/intro-stats.png",
  "./assets/images/intro-mentalhealth.png",
  "./assets/images/outro-symposium.png",
  "./assets/images/outro-event.png",
  "./assets/images/showcase-01.png",
  "./assets/images/showcase-02.png",
  "./assets/images/showcase-03.png",
  "./assets/images/sermon-01.png",
  "./assets/images/sermon-02.png",
  "./assets/images/sermon-03.png",
  "./assets/images/sermon-04.png",
  "./assets/images/sermon-05.png",
  "./assets/images/sermon-06.png",
  "./assets/images/sermon-07.png",
  "./assets/images/sermon-08.png",
  "./assets/images/sermon-09.png",
  "./assets/images/sermon-10.png",
  "./assets/images/sermon-11.png",
  "./assets/images/sermon-12.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Added individually rather than via cache.addAll() because addAll()
      // rejects the WHOLE install if even one file 404s, which would leave
      // the app with no offline support at all and no clue why. This way a
      // single bad path only loses that one file, and logs which one.
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.error("[sw] failed to cache:", url, err);
            throw err;
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navigation requests fall back to the cached shell so a deep link or a
  // refresh while offline still boots the app instead of showing the
  // browser's offline error page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("./index.html").then((cached) => cached || caches.match("./"))
      )
    );
    return;
  }

  // Cache-first: everything the app needs is precached, so this serves
  // instantly offline and online alike. Anything not precached falls through
  // to the network and is cached on the way past.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
