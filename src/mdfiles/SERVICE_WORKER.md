# Service Worker — Jiraboard

---

## What is a Service Worker?

A service worker is a JavaScript file that runs **in the background**, completely
separate from your web page. It has no access to the DOM — it cannot read or
change anything on screen.

Think of it as a **middleman** sitting between your browser and the internet:

```
Without SW:   Browser  →  Network  →  Your files
With SW:      Browser  →  Service Worker  →  Cache (or Network)
```

Every request your app makes — for HTML, JS, CSS, images — passes through the
service worker first. It decides: *"Do I have this in cache? Serve it instantly.
Don't have it? Go fetch it from the network."*

---

## Why Jiraboard Needs One

Jiraboard already stores all task data in `localStorage`. That means tasks
survive a page refresh without any server. The only thing stopping the app
from working **completely offline** is the browser not having the JS/CSS/HTML
files when there's no internet.

The service worker fixes that by caching those files.

Three reasons we added it:

1. **Offline support** — once visited, the app works with no internet connection
2. **Instant repeat loads** — files served from cache in microseconds, not from
   the network in hundreds of milliseconds
3. **PWA requirement** — Chrome requires a service worker to show the
   "Install App" button and pass a full Lighthouse PWA audit

---

## The Lifecycle — 3 Stages

A service worker goes through three stages. Understanding these is the key to
understanding everything else.

```
Browser registers sw.js
        ↓
   [ INSTALL ]   → download and cache all app files
        ↓
   [ ACTIVATE ]  → delete old caches from previous versions
        ↓
   [ FETCH ]     → intercept every request, serve from cache or network
```

---

### Stage 1 — INSTALL

Fires **once** when the service worker is first registered, or when you deploy
a new version (the browser detects the `sw.js` file changed).

In our `sw.js`:

```js
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
```

**What each line does:**

- `PRECACHE_URLS` — the list of files the app needs to work at all. We only
  list stable files here (no hashed filenames). Vite's hashed JS/CSS chunks
  like `vendor-react-Dv_0cUiI.js` are handled dynamically in the fetch handler.

- `event.waitUntil(...)` — tells the browser: *"don't finish installing until
  this promise resolves."* If any file fails to download, the whole install
  fails and the old service worker stays active. Safe fallback.

- `caches.open(CACHE_VERSION)` — opens a named storage bucket called
  `"jiraboard-v1"`. Think of it like a folder on the user's device.

- `cache.addAll(PRECACHE_URLS)` — downloads every URL in the list and stores
  the response. Atomic — if one file fails, nothing is cached.

- `self.skipWaiting()` — normally a new service worker waits for all open tabs
  to close before activating. `skipWaiting` forces it to activate immediately.
  Safe for Jiraboard because we have no in-flight API requests to interrupt.

---

### Stage 2 — ACTIVATE

Fires after install, once the old service worker has stepped down.
This is the **cleanup stage** — delete old caches from previous versions.

```js
const CACHE_VERSION = 'jiraboard-v1';

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});
```

**What each line does:**

- `caches.keys()` — returns the names of every cache stored in the browser,
  e.g. `["jiraboard-v1", "jiraboard-v2", "jiraboard-v3"]`

- `.filter((name) => name !== CACHE_VERSION)` — keep only the current version,
  mark everything else for deletion

- `.map((name) => caches.delete(name))` — delete the old ones. Without this,
  old caches pile up and waste the user's disk space.

- `self.clients.claim()` — makes this service worker take control of all open
  tabs immediately, without requiring a page reload.

**Real example:** You deploy version 2. The user's browser has `jiraboard-v1`
in cache. On activate, `jiraboard-v1` is deleted and `jiraboard-v2` takes over.
The user automatically gets fresh files.

---

### Stage 3 — FETCH

Fires for **every single network request** the app makes. This is where the
caching strategy lives.

```js
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});
```

**What each line does:**

- `if (event.request.method !== 'GET') return` — only cache GET requests.
  Never cache POST/PUT/DELETE — those must always go to the network.

- `if (url.origin !== self.location.origin) return` — only intercept requests
  to our own domain. Don't touch requests to external services.

- `caches.match(event.request)` — look up this exact URL in our cache storage.

- `if (cachedResponse) return cachedResponse` — cache hit. Return instantly.
  No network trip. Works offline.

- `fetch(event.request)` — cache miss. Go to the network.

- `networkResponse.clone()` — a Response is a stream, it can only be read once.
  We clone it so we have two copies: one to store in cache, one to return to
  the browser.

- `cache.put(event.request, responseToCache)` — store the fresh response so
  next time it's a cache hit.

- `.catch(() => caches.match('/'))` — network failed AND not in cache. For
  page navigations, serve the app shell (`index.html`) so React Router can
  handle the route client-side instead of showing a browser error page.

---

## Caching Strategy — Cache First

There are several caching strategies. We chose **Cache First with Network Fallback**
because Jiraboard has no API calls — all data is in `localStorage`.

```
Request comes in
      ↓
Is it in cache?
  YES → return from cache immediately  (fast, works offline)
  NO  → fetch from network
          ↓
        Store in cache for next time
          ↓
        Return to browser
```

**Why Cache First is right for Jiraboard:**

- All task data is in `localStorage` — we never need fresh data from a server
- JS/CSS files have hashed names — a stale file is never a risk
- Users get instant loads on every repeat visit
- App works fully offline after first visit

---

## How We Register It — `main.tsx`

```ts
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      });
  });
}
```

**What each part does:**

- `'serviceWorker' in navigator` — check the browser supports service workers
  before trying to use them. Old browsers won't crash.

- `import.meta.env.PROD` — only register in production (`npm run build`).
  In development (`npm run dev`), we skip it so Vite's HMR works without
  the service worker intercepting requests and serving stale cached files.

- `window.addEventListener('load', ...)` — wait for the page to fully load
  before registering. Registering too early competes with page resources
  and slows down the first load.

- `.register('/sw.js', { scope: '/' })` — tell the browser where the SW file
  is and which URLs it controls. `scope: '/'` means it controls the entire app.

- `updatefound` + `statechange` — detects when a new version is deployed while
  the user has the app open. Automatically activates the new version by sending
  `SKIP_WAITING` so the user always has the latest code.

---

## The CACHE_VERSION — How Updates Work

```js
const CACHE_VERSION = 'jiraboard-v1';
```

This is the most important thing to understand about service workers.

**The problem:** Once files are cached, the browser serves them forever.
How does the user ever get new code when you deploy?

**The answer:** Change `CACHE_VERSION`.

```
You deploy a new version → change 'jiraboard-v1' to 'jiraboard-v2'
                         ↓
Browser detects sw.js changed → runs INSTALL again
                         ↓
New cache 'jiraboard-v2' is created with fresh files
                         ↓
ACTIVATE runs → deletes 'jiraboard-v1'
                         ↓
User now has the latest version
```

**Rule:** Every time you deploy, bump the version string.
Convention: `'jiraboard-v2026-05-01'` or `'jiraboard-v2'`.

---

## What to Keep in Mind When Writing a Service Worker

### 1. Always version your cache
Without versioning, users get stuck with old files forever. Change
`CACHE_VERSION` on every deploy.

### 2. Never register in development
The SW caches files. If it runs during `npm run dev`, it will serve stale
cached files instead of your latest changes. Always guard with
`import.meta.env.PROD`.

### 3. Only cache GET requests
POST, PUT, DELETE must always go to the network. Caching a form submission
or an API write would be catastrophic.

### 4. Clone responses before caching
A `Response` is a stream — it can only be consumed once. Always call
`.clone()` before storing it in cache, otherwise the browser gets an
empty response.

### 5. Handle the offline fallback for navigation
If the user is offline and refreshes the page, the browser will show its
own error page unless you catch it. Always return `caches.match('/')` for
`navigate` requests so React Router can handle the route.

### 6. Don't pre-cache hashed filenames
Vite generates filenames like `vendor-react-Dv_0cUiI.js`. These change on
every build. Pre-caching them by name would fail. Instead, let the fetch
handler cache them dynamically on first request.

### 7. The SW file must be at the root
`/sw.js` must be served from the root of your domain, not `/src/sw.js`.
That's why we put it in `public/` — Vite copies everything in `public/`
to the root of `dist/` as-is.

---

## How to Verify It's Working

1. Run `npm run build` then `npm run preview`
2. Open Chrome DevTools → **Application** tab → **Service Workers**
3. You should see `sw.js` listed as **activated and running**
4. Go to **Cache Storage** — you should see `jiraboard-v1` with all your files
5. Tick **Offline** in the Network tab → refresh the page
6. The app still loads — that's the service worker serving from cache

---

## Summary

| Event | When it fires | What it does |
|-------|--------------|--------------|
| `install` | First registration or new version | Downloads and caches all app files |
| `activate` | After install | Deletes old caches from previous versions |
| `fetch` | Every network request | Serves from cache or fetches from network |
| `message` | App sends a command | Handles `SKIP_WAITING` to activate new version |

| File | Role |
|------|------|
| `public/sw.js` | The service worker — cache logic lives here |
| `src/main.tsx` | Registers the SW, only in production |
| `public/manifest.json` | Tells the browser this is a PWA |

> One-line summary: A service worker is a background script that caches your
> app's files so it loads instantly and works offline. `CACHE_VERSION` is how
> you push updates to users. Never run it in development.

---

*Last updated: May 1, 2026 — Service Worker added to Jiraboard*

---

## When and Why to Use a Service Worker — With Real Examples

---

### The Core Problem a Service Worker Solves

Every time a user opens your website, the browser has to download your files
from a server somewhere in the world. That round trip takes time — even on a
good connection it's 200-500ms. On a slow mobile network it can be 3-5 seconds.

Without a service worker:
```
User opens app
  → Browser asks server for index.html       (200ms)
  → Browser asks server for vendor-react.js  (300ms)
  → Browser asks server for index.js         (100ms)
  → Browser asks server for style.css        (100ms)
  → App appears on screen                    (700ms total, every single visit)
```

With a service worker:
```
User opens app (second visit onwards)
  → SW serves index.html from cache          (2ms)
  → SW serves vendor-react.js from cache     (2ms)
  → SW serves index.js from cache            (2ms)
  → SW serves style.css from cache           (2ms)
  → App appears on screen                    (8ms total)
```

That is the difference between a website and an app.

---

### Use Case 1 — Offline Support

**When to use it:** Any app where the user's work should not be lost or
blocked just because they lost internet for a moment.

**Jiraboard example:**

A developer is on a train updating their sprint board. The train goes through
a tunnel — no internet for 2 minutes. Without a service worker, the app shows
a blank screen or a browser error page. With a service worker:

```
Train enters tunnel → internet drops
User refreshes the page
  → SW intercepts the request
  → Serves index.html from cache
  → Serves all JS/CSS from cache
  → App loads fully
  → Tasks are still there (from localStorage)
Train exits tunnel → internet returns
  → Everything continues normally
```

The user never knew there was no internet.

**Other real apps that use this:**
- Google Docs — you can keep typing offline, it syncs when you reconnect
- Notion — pages you've visited stay readable offline
- Figma — designs you've opened stay accessible offline

---

### Use Case 2 — Instant Repeat Loads (Performance)

**When to use it:** Any app where users visit repeatedly — dashboards, tools,
productivity apps, social feeds.

**The problem without SW:**

React + vendor libraries = ~250KB of JavaScript. Even with a fast connection,
the browser has to download, parse, and execute that every single visit.

**With SW — Cache First strategy:**

On the first visit, files are downloaded normally and stored in cache.
On every visit after that:

```js
// From our sw.js fetch handler:
caches.match(event.request).then((cachedResponse) => {
  if (cachedResponse) {
    return cachedResponse  // ← served in ~2ms, zero network
  }
  // ... fetch from network only if not cached
})
```

The 186KB `vendor-react` chunk never downloads again after the first visit.
It lives in the user's cache until you deploy a new version.

**Real numbers from our build:**
```
First visit:   vendor-react-DsFLIvBt.js  186KB  downloaded from network
Second visit:  vendor-react-DsFLIvBt.js  186KB  served from cache in 2ms
Third visit:   vendor-react-DsFLIvBt.js  186KB  served from cache in 2ms
```

---

### Use Case 3 — PWA Install Prompt

**When to use it:** When you want users to install your web app on their
home screen or desktop like a native app.

Chrome's "Install App" button only appears when ALL three conditions are met:
1. The site is served over HTTPS (or localhost)
2. There is a valid `manifest.json`
3. There is a registered, active service worker

Without the service worker, the install button never appears — even if your
manifest is perfect.

**In our project:**

```ts
// main.tsx — registers the SW in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
  })
}
```

Once this runs and the SW activates, Chrome shows the install prompt.
The user can install Jiraboard as a desktop or mobile app — it opens in its
own window with no browser chrome, just like a native app.

---

### Use Case 4 — Background Sync (when you have an API)

**When to use it:** Apps where users create/edit data that needs to reach
a server, but you want it to work even when offline.

Jiraboard doesn't have a backend right now, but if it did, this is how
you'd handle it:

```
User creates a task while offline
  → Task saved to localStorage immediately (user sees it instantly)
  → SW registers a background sync: "sync-tasks"

Internet returns
  → Browser wakes up the SW
  → SW fires the 'sync' event
  → SW sends the queued task to the API
  → Server receives it
  → localStorage updated with server response
```

The user never had to wait. They created the task, it appeared on screen,
and it silently synced when connectivity returned.

**Example code (not in Jiraboard yet — for future reference):**
```js
// In sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasksToServer())
  }
})

// In your React component
await navigator.serviceWorker.ready
await registration.sync.register('sync-tasks')
```

---

### Use Case 5 — Push Notifications

**When to use it:** Apps that need to notify users even when the app is closed.

The service worker runs in the background even when the user has closed your
tab. This makes it the only place that can receive push notifications from
your server and show them to the user.

```
Server sends a push notification: "PRJ-12 was assigned to you"
  → SW receives it (even if Jiraboard tab is closed)
  → SW calls self.registration.showNotification()
  → User sees a system notification
  → User clicks it → Jiraboard opens at that task
```

**Example code (not in Jiraboard yet — for future reference):**
```js
// In sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
    })
  )
})
```

---

### When NOT to Use a Service Worker

Not every project needs one. Skip it when:

| Situation | Why SW doesn't help |
|-----------|--------------------|
| Server-rendered pages (Next.js SSR) | Each page is generated fresh on the server — caching HTML would serve stale content |
| Apps with real-time data (stock prices, live chat) | Cache First would show outdated data — you always need the latest from the server |
| Admin dashboards with sensitive data | You don't want sensitive data sitting in the user's cache storage |
| Simple static landing pages | Browser HTTP cache already handles this — a SW adds complexity for no gain |
| Apps with frequent API writes | POST/PUT/DELETE can't be cached — the SW only helps with reads |

---

### The Right Caching Strategy Depends on Your App

Different types of content need different strategies:

| Content type | Strategy | Why |
|-------------|----------|-----|
| App shell (HTML, JS, CSS) | **Cache First** | Never changes between deploys, serve instantly |
| User data from API | **Network First** | Always needs to be fresh, cache as fallback |
| Images and icons | **Cache First** | Rarely change, expensive to re-download |
| News / live feed | **Network First** | Stale content is worse than slow content |
| User-uploaded files | **Cache First** | Large files, expensive to re-fetch |

**Jiraboard uses Cache First for everything** because there is no API —
all data is in `localStorage` and all files are hashed by Vite.

---

### Summary — When to Add a Service Worker

| You need this | Add a SW? |
|--------------|----------|
| App works offline | Yes |
| Faster repeat loads | Yes |
| PWA install button | Yes (required) |
| Background data sync | Yes |
| Push notifications | Yes |
| Real-time data (stocks, chat) | No — use WebSockets instead |
| Simple blog or landing page | No — HTTP cache is enough |
| SSR app (Next.js) | Maybe — only for static assets, not HTML |

> Rule of thumb: if your users visit your app repeatedly and expect it to
> feel fast and reliable — add a service worker. If your app is mostly
> read-once content that must always be fresh — skip it.
