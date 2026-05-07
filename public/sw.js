// ─────────────────────────────────────────────────────────────────────────────
// sw.js — Jiraboard Service Worker
//
// WHAT IS THIS FILE?
// This file is a Service Worker. It runs in the background, completely
// separate from your web page. Think of it as a security guard standing
// at the door of your app. Every time the browser asks for a file
// (HTML, JS, CSS, image), the request passes through this guard first.
// The guard checks: "Do I already have this file stored? Yes → hand it over
// instantly. No → go fetch it from the internet, keep a copy, hand it over."
//
// WHY IS IT IN public/ FOLDER?
// Vite copies everything in public/ to the root of dist/ as-is.
// The browser requires the SW file to be at the ROOT of your domain
// (e.g. yoursite.com/sw.js). If it were at /src/sw.js, it would only
// control files under /src/ — useless. public/ ensures it lands at /.
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// CACHE_VERSION — The version label for our storage bucket
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT IS IT?
// A simple string that acts as the NAME of our cache storage bucket.
// Think of it like a folder name on the user's device: "jiraboard-v1".
// All cached files go inside this named folder.
//
// WHY DO WE NEED IT?
// Imagine you deploy a new version of Jiraboard with bug fixes.
// The user's browser still has the OLD files cached under "jiraboard-v1".
// If we just update the files, the browser keeps serving the old ones forever.
//
// The fix: change the name to "jiraboard-v2".
// The browser sees a new name → creates a fresh empty bucket → downloads
// all files again → deletes the old "jiraboard-v1" bucket.
// The user automatically gets your latest code.
//
// RULE: Change this string every single time you deploy a new version.
// Convention: 'jiraboard-v2', 'jiraboard-v2026-05-01', etc.
//
const CACHE_VERSION = 'jiraboard-v1';


// ─────────────────────────────────────────────────────────────────────────────
// PRECACHE_URLS — The list of files to download and store on first visit
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT IS IT?
// An array of file paths that we want to download and store in cache
// BEFORE the user even clicks anything. This happens silently in the
// background the moment the service worker installs.
//
// WHY DO WE PRE-CACHE THESE SPECIFIC FILES?
// These are the files the app needs just to OPEN. Without them, the user
// sees a blank screen. By caching them upfront, we guarantee the app
// works offline from the very first visit.
//
// WHY NOT INCLUDE THE HASHED JS/CSS FILES HERE?
// Vite generates filenames like vendor-react-Dv_0cUiI.js — the hash part
// (Dv_0cUiI) changes on every build. If we hardcoded that name here,
// it would break after every deployment. Instead, those files get cached
// automatically the first time the browser requests them (handled in the
// fetch event below). We only list files whose names NEVER change here.
//
const PRECACHE_URLS = [

  // '/' — The HTML shell
  // This is index.html served at the root URL.
  // It's the skeleton of the entire app — the <div id="root"> that React
  // mounts into. Without this file, nothing renders at all.
  // Caching it means the app can open even with no internet.
  '/',

  // '/manifest.json' — The PWA identity card
  // Contains the app name, icons, theme colour, display mode etc.
  // The browser reads this to show the "Install App" prompt and to
  // know how the app should look when installed on a home screen.
  // We cache it so the install prompt works offline too.
  '/manifest.json',

  // '/favicon.svg' — The browser tab icon
  // The small icon shown in the browser tab and bookmarks bar.
  // Caching it prevents a broken icon image when offline.
  '/favicon.svg',

  // '/icon-192.png' — Home screen icon (small size)
  // Used by Android when the user adds the app to their home screen.
  // 192x192 pixels — the standard size for app drawer and home screen icons.
  // Without this cached, the home screen icon shows a broken image offline.
  '/icon-192.png',

  // '/icon-512.png' — Splash screen icon (large size)
  // Used for the splash screen shown while the app is loading after
  // being launched from the home screen. Also used by the Play Store
  // if you publish via PWA Builder. 512x512 pixels.
  '/icon-512.png',

  // '/screenshot-mobile.png' — PWA install prompt preview (mobile)
  // Chrome shows this image inside the "Install App" dialog on mobile
  // so the user can preview what the app looks like before installing.
  // Without it, the install prompt shows a plain boring dialog instead
  // of a rich card with a preview.
  '/screenshot-mobile.png',

  // '/screenshot-desktop.png' — PWA install prompt preview (desktop)
  // Same as above but for desktop Chrome. The 'form_factor: wide' in
  // manifest.json tells Chrome to use this one on desktop screens.
  '/screenshot-desktop.png',
];


// ─────────────────────────────────────────────────────────────────────────────
// INSTALL EVENT — "Set up the cache on first visit"
// ─────────────────────────────────────────────────────────────────────────────
//
// WHEN DOES IT FIRE?
// Exactly once — when the browser first registers this service worker,
// OR when you deploy a new version and the browser detects sw.js changed.
//
// WHAT IS ITS JOB?
// Download every file in PRECACHE_URLS and store them in our cache bucket.
// Think of it like a new employee's first day: before they start taking
// customer calls, they spend the morning reading all the manuals and
// storing the information they'll need. That's the install event.
//
// ANALOGY:
// You're opening a new shop. Before you open the doors, you stock the
// shelves with everything customers might ask for. The install event
// is the "stocking the shelves" step.
//
self.addEventListener('install', (event) => {

  // event.waitUntil(promise)
  // PURPOSE: Tells the browser "don't finish installing until this
  // promise resolves." If the promise rejects (e.g. a file fails to
  // download), the entire install fails and the OLD service worker
  // stays active. This is a safety net — a half-installed SW is
  // worse than no SW at all.
  event.waitUntil(

    // caches.open(CACHE_VERSION)
    // PURPOSE: Opens (or creates) a named storage bucket called "jiraboard-v1".
    // Think of it like opening a specific drawer in a filing cabinet.
    // If the drawer doesn't exist yet, it creates it.
    // Returns a promise that resolves with the cache object.
    caches.open(CACHE_VERSION)
      .then((cache) => {

        // cache.addAll(PRECACHE_URLS)
        // PURPOSE: Takes every URL in our list, fetches each one from
        // the network, and stores the response in the cache bucket.
        // IMPORTANT: This is ATOMIC — if even ONE file fails to download,
        // the entire operation fails and NOTHING gets cached. This prevents
        // a situation where the app is half-cached and broken.
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {

        // self.skipWaiting()
        // PURPOSE: Normally, a newly installed service worker sits in a
        // "waiting" state. It won't take control until ALL tabs using the
        // old SW are closed. This could mean the user has to close and
        // reopen the app to get the new version — bad UX.
        // skipWaiting() says: "Don't wait. Activate immediately."
        // Safe for Jiraboard because we have no in-flight API requests
        // that could be interrupted by a sudden SW swap.
        return self.skipWaiting();
      })
  );
});


// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE EVENT — "Clean up old caches after a new version installs"
// ─────────────────────────────────────────────────────────────────────────────
//
// WHEN DOES IT FIRE?
// Right after install completes and the new SW takes over from the old one.
//
// WHAT IS ITS JOB?
// Delete old cache buckets from previous versions so they don't pile up
// and waste the user's disk space.
//
// ANALOGY:
// You've restocked the shop shelves with new products (install).
// Now you go through the back room and throw away all the old stock
// from last season that nobody needs anymore. That's the activate event.
//
// REAL EXAMPLE:
// User has "jiraboard-v1" cached. You deploy a new version → CACHE_VERSION
// becomes "jiraboard-v2". On activate, "jiraboard-v1" is found and deleted.
// Only "jiraboard-v2" remains. The user has fresh files, no wasted space.
//
self.addEventListener('activate', (event) => {

  event.waitUntil(

    // caches.keys()
    // PURPOSE: Returns an array of ALL cache bucket names currently stored
    // in the browser for this origin. For example:
    // ["jiraboard-v1", "jiraboard-v2", "some-other-cache"]
    // We need this list so we know which ones to delete.
    caches.keys()
      .then((cacheNames) => {

        // Promise.all([...])
        // PURPOSE: Run multiple delete operations at the same time (in parallel)
        // and wait for ALL of them to finish before moving on.
        // More efficient than deleting one by one.
        return Promise.all(
          cacheNames

            // .filter((name) => name !== CACHE_VERSION)
            // PURPOSE: Keep only the cache whose name matches our current
            // version. Everything else is old and should be deleted.
            // Example: if CACHE_VERSION is "jiraboard-v2", this keeps
            // "jiraboard-v2" and marks "jiraboard-v1" for deletion.
            .filter((name) => name !== CACHE_VERSION)

            // .map((name) => caches.delete(name))
            // PURPOSE: For each old cache name, delete that bucket entirely.
            // caches.delete() removes the bucket AND all files inside it.
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {

        // self.clients.claim()
        // PURPOSE: After activating, this SW doesn't automatically control
        // tabs that were already open before it activated. claim() fixes that
        // — it immediately takes control of ALL open tabs without requiring
        // the user to reload. Combined with skipWaiting() above, this means
        // new deployments take effect instantly with zero user action needed.
        return self.clients.claim();
      })
  );
});


// ─────────────────────────────────────────────────────────────────────────────
// FETCH EVENT — "Intercept every network request and decide what to return"
// ─────────────────────────────────────────────────────────────────────────────
//
// WHEN DOES IT FIRE?
// Every single time the browser makes a network request — for HTML, JS,
// CSS, images, fonts, API calls, everything. This is the most important
// event. It's where the actual caching magic happens.
//
// WHAT IS ITS JOB?
// Act as the middleman. Check if we have the requested file in cache.
// If yes → return it instantly. If no → fetch from network, store it,
// return it. If network fails → return a safe fallback.
//
// STRATEGY: Cache First with Network Fallback
// Check cache first → if found, done. If not, go to network.
//
// ANALOGY:
// You ask a librarian for a book. The librarian first checks the shelf
// (cache). If it's there, they hand it to you immediately. If not, they
// order it from the warehouse (network), put a copy on the shelf for
// next time, and hand you the original.
//
self.addEventListener('fetch', (event) => {

  // if (event.request.method !== 'GET') return
  // PURPOSE: Only intercept GET requests (reading files).
  // Never intercept POST, PUT, DELETE — those are write operations
  // (form submissions, API calls) that MUST always go to the real server.
  // Caching a write operation would be catastrophic — imagine caching
  // "delete this task" and replaying it every time the user visits.
  if (event.request.method !== 'GET') return;

  // const url = new URL(event.request.url)
  // PURPOSE: Parse the full URL of the request into its parts
  // (origin, pathname, search params etc.) so we can inspect it.
  const url = new URL(event.request.url);

  // if (url.origin !== self.location.origin) return
  // PURPOSE: Only intercept requests to OUR OWN domain.
  // Don't touch requests to external services like Google Fonts,
  // analytics scripts, CDNs, or any third-party API.
  // self.location.origin is our domain (e.g. "https://yoursite.com").
  // If the request goes somewhere else, let it pass through untouched.
  if (url.origin !== self.location.origin) return;

  // event.respondWith(promise)
  // PURPOSE: This is how we "hijack" the request and return our own response.
  // Whatever promise we pass here — its resolved value becomes the response
  // the browser receives. Without this, the browser would just fetch normally.
  // IMPORTANT: The promise MUST resolve with a valid Response object.
  // Returning undefined or null causes "Failed to convert value to Response".
  event.respondWith(

    // caches.match(event.request)
    // PURPOSE: Look up the requested URL in ALL our cache buckets.
    // Returns the cached Response if found, or undefined if not found.
    // This is the "check the shelf" step.
    caches.match(event.request)
      .then((cachedResponse) => {

        // if (cachedResponse) return cachedResponse
        // PURPOSE: Cache HIT — we found the file in cache.
        // Return it immediately. No network request needed.
        // This is what makes repeat visits instant and works offline.
        // The user gets the file in ~2ms instead of ~300ms.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If we reach here, the file is NOT in cache (cache MISS).
        // This happens on the first visit, or for new hashed JS chunks
        // that were lazy-loaded for the first time.
        // Go fetch it from the network.

        // fetch(event.request)
        // PURPOSE: Make the actual network request to the server.
        // This is the normal browser fetch — same as if the SW wasn't here.
        return fetch(event.request)
          .then((networkResponse) => {

            // Validate the response before caching it.
            // We only want to cache successful, complete responses.
            // Don't cache:
            //   - null/undefined (fetch failed silently)
            //   - status !== 200 (404 Not Found, 500 Server Error, etc.)
            //   - type === 'error' (network error)
            // If the response is bad, just return it as-is without caching.
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === 'error'
            ) {
              return networkResponse;
            }

            // networkResponse.clone()
            // PURPOSE: A Response object is a STREAM — like a water pipe.
            // Once you read from it, it's empty. You can't read it twice.
            // We need to do TWO things with this response:
            //   1. Store it in cache
            //   2. Return it to the browser
            // clone() creates an identical copy so we have two separate
            // streams — one for each purpose. Without clone(), the browser
            // would receive an empty response after we stored it in cache.
            const responseToCache = networkResponse.clone();

            // Store the cloned copy in cache for next time.
            // We don't await this — it runs in the background.
            // The user gets their response immediately while caching
            // happens silently behind the scenes.
            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(event.request, responseToCache));

            // Return the original response to the browser.
            return networkResponse;
          })

          .catch(() => {
            // We reach here when BOTH conditions are true:
            //   1. The file was NOT in cache
            //   2. The network request FAILED (user is offline)
            // This is the "truly offline, file never cached" scenario.

            // For navigation requests (user typed a URL, clicked a link,
            // or refreshed the page), serve the app shell (index.html).
            // Why? Because React Router handles routing client-side.
            // If we let the browser show its own "No internet" error page,
            // the user loses the app entirely. By serving index.html,
            // React loads, React Router reads the URL, and renders the
            // correct page — all from cache. The user never sees an error.
            if (event.request.mode === 'navigate') {
              return caches.match('/').then((res) => res || new Response('Offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
              }));
            }

            // For all other assets (JS chunks, CSS, images):
            // We MUST return a valid Response object here.
            // If we return undefined (or nothing), the browser throws:
            // "Failed to convert value to Response" — which was the
            // exact error we fixed. An empty 503 response is valid
            // and tells the browser "this resource is unavailable right now."
            return new Response('', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});


// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE EVENT — "Receive commands from the React app"
// ─────────────────────────────────────────────────────────────────────────────
//
// WHEN DOES IT FIRE?
// When your React app sends a message to the service worker using:
//   navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
//
// WHAT IS ITS JOB?
// Act as a remote control. The React app can send commands to the SW
// and the SW acts on them. Currently we support one command: SKIP_WAITING.
//
// WHY DO WE NEED THIS?
// Scenario: User has Jiraboard open. You deploy a new version.
// The new SW installs silently in the background but sits in "waiting"
// state — it won't activate until the user closes all tabs.
// With this message handler, your React app can detect the waiting SW
// and send SKIP_WAITING to activate it immediately — no tab close needed.
// In main.tsx we do this automatically, but in a real app you'd show
// a "New version available — click to update" toast first.
//
self.addEventListener('message', (event) => {

  // event.data?.type === 'SKIP_WAITING'
  // PURPOSE: Check what command was sent. We use optional chaining (?.)
  // because event.data could be null if someone sends a malformed message.
  // Only act on the specific command we recognise — ignore everything else.
  if (event.data?.type === 'SKIP_WAITING') {

    // self.skipWaiting()
    // PURPOSE: Force the waiting service worker to activate immediately,
    // skipping the normal "wait for all tabs to close" requirement.
    // After this runs, the new SW takes over and the user has the latest
    // version of the app without closing or refreshing anything.
    self.skipWaiting();
  }
});
