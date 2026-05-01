# Accessibility, SEO & Indexing Guide — Jiraboard

This document explains every accessibility (a11y), SEO, and crawler-indexing improvement made to the Jiraboard Kanban dashboard, **why** it matters, and **how** it works.

---

## 1. Web Accessibility (WCAG 2.1 AA targeted)

Accessibility means people using screen readers, keyboards only, voice control, magnifiers, or who have cognitive/motor differences can use the app equally well.

### 1.1 Semantic landmarks

We replaced generic `<div>` wrappers with semantic HTML so assistive tech can jump between regions:

| Region | Element | Why |
|---|---|---|
| Sidebar | `<aside aria-label="Primary navigation">` with nested `<nav>` | Identifies it as a complementary navigation landmark |
| Top bar | `<header role="search">` | Marks the search/filter region |
| Page body | `<main id="main-content">` | The primary landmark — only one per page |
| Column titles | `<h2>` per column, `<h1>` for board title | Correct heading outline (one H1, then H2s) |
| Card list | `<ul>` / `<li>` instead of plain divs | Screen readers announce "list, 4 items" |

### 1.2 Skip link

```html
<a href="#main-content" className="skip-link">Skip to main content</a>
```

Hidden until focused. The first Tab press lets keyboard users jump past the sidebar straight into the board — required by WCAG 2.4.1 *Bypass Blocks*.

### 1.3 Visible focus ring

```css
.jira-app :focus-visible {
  outline: 2px solid #0052cc;
  outline-offset: 2px;
}
```

We use `:focus-visible` (not `:focus`) so the ring only shows for **keyboard** users — mouse clicks don't draw distracting rings. WCAG 2.4.7 *Focus Visible*.

### 1.4 Keyboard-accessible drag and drop

Native HTML5 drag and drop is **mouse-only**. We added a parallel keyboard flow:

| Key | Action |
|---|---|
| `Tab` | Move focus to a card |
| `Enter` | Open the card to edit |
| `Space` | Pick up / drop the card |
| `←` / `→` | Move picked-up card to the previous/next column |
| `Esc` | Cancel pickup |

Each card uses `tabIndex={0}`, `role="button"`, and an `aria-grabbed` state, so screen reader users hear *"picked up / dropped"* and know what's happening. This satisfies WCAG 2.1.1 *Keyboard*.

### 1.5 Live announcements (ARIA live region)

```jsx
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

When a task is created, edited, deleted, or moved, we update this hidden region. Screen readers automatically read the new text — for example: *"Moved Fix login bug to In Progress."* WCAG 4.1.3 *Status Messages*.

### 1.6 Form labels & validation

In `TaskModal.tsx` every control has an explicit `<label htmlFor>` paired with a unique `useId()`. The required Summary field uses `required`, `aria-required`, and `aria-invalid`. Errors are rendered with `role="alert"` so they're announced immediately.

### 1.7 Modal dialog semantics

```jsx
<form role="dialog" aria-modal="true" aria-labelledby={headingId}>
```

Plus:
- Auto-focus the first input on open
- `Esc` closes the modal
- Focus is **returned** to the element that opened the modal (`previousFocus.current?.focus()`)

WCAG 2.4.3 *Focus Order* and 2.1.2 *No Keyboard Trap*.

### 1.8 Icon-only content gets text alternatives

- Decorative glyphs (▦, ↑↑, initials): wrapped in `aria-hidden="true"` so they aren't read as gibberish
- Meaningful icons (avatars, priority chips, type badges): given `role="img"` + descriptive `aria-label` (e.g. `aria-label="Priority: high"`)

WCAG 1.1.1 *Non-text Content*.

### 1.9 Search input

Uses `type="search"` (better mobile keyboard, clearable) and a screen-reader-only `<label>`.

### 1.10 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

Respects users who set "Reduce motion" in their OS — preventing nausea/vestibular issues. WCAG 2.3.3.

### 1.11 Color contrast

All text/background pairs in `dashboard.css` (e.g. `#172b4d` on `#ffffff`, white on `#0052cc`) meet WCAG AA 4.5:1 contrast for normal text.

### 1.12 Language declaration

`<html lang="en">` in `index.html` — required by WCAG 3.1.1 so screen readers pick the correct pronunciation.

---

## 2. SEO (Search Engine Optimization)

### 2.1 Title and meta description

```html
<title>Jiraboard – Kanban Project Dashboard with Drag & Drop</title>
<meta name="description" content="Jiraboard is a fast, accessible Kanban dashboard for managing tasks, bugs and stories with drag-and-drop, search and filters." />
```

- **Title** under 60 chars, contains primary keyword ("Kanban Project Dashboard")
- **Description** under 160 chars, written for humans (CTR), not just keywords

### 2.2 Canonical URL

```html
<link rel="canonical" href="https://.../" />
```

Tells Google which URL is the "real" one when the same page is reachable via several URLs (with/without trailing slash, query strings). Prevents duplicate-content penalties.

### 2.3 Open Graph & Twitter Cards

`og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `twitter:card=summary_large_image`. Controls how the link looks when shared on Facebook, LinkedIn, Slack, X/Twitter, iMessage etc.

### 2.4 Structured data (JSON-LD)

```json
{ "@context": "https://schema.org", "@type": "WebApplication", ... }
```

Helps Google understand the page is a web application — can earn rich results in search. Schema.org `WebApplication` is the right type for a tool like this.

### 2.5 Single H1 + heading hierarchy

`Sprint 24 Board` is the page's only `<h1>`. Column names are `<h2>`. This helps both SEO crawlers (topic understanding) and screen readers (document outline).

### 2.6 Mobile-friendly

`<meta name="viewport" content="width=device-width, initial-scale=1.0">` plus a responsive layout (CSS grid + a 768px breakpoint). Google uses mobile-first indexing — non-responsive pages rank poorly.

### 2.7 Theme color

`<meta name="theme-color" content="#0052cc">` — improves brand presence in mobile browser chrome, PWAs, and Discord embeds.

---

## 3. Indexing (`robots.txt` + `sitemap.xml`)

### 3.1 `public/robots.txt`

Lives at the site root (`/robots.txt`). Crawlers fetch it **before anything else**. Our file:

- **Explicitly allows** the major search bots (Googlebot, Bingbot, DuckDuckBot)
- **Allows** social-preview bots (Twitterbot, facebookexternalhit, LinkedInBot) so link previews work
- **Disallows** AI training scrapers (`GPTBot`, `CCBot`) — optional; remove these blocks if you want your site used to train AI models
- **Disallows** internal/API paths (`/api/`, raw `*.json`) for general bots
- **Points to the sitemap** with a `Sitemap:` directive — the standard way to advertise it

> ⚠️ `robots.txt` is a *politeness contract*, not security. Never use it to hide secrets — use authentication instead.

### 3.2 `public/sitemap.xml`

Lists every public URL with `<changefreq>` and `<priority>` hints. Helps Google discover and prioritize pages — especially important for SPAs where there are no `<a href>` links between pages for the crawler to follow.

Add a new `<url>` block whenever you add a public route.

### 3.3 Robots meta tag

```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
```

- `index, follow` — index this page and follow its links
- `max-image-preview:large` — allow Google to show a big preview image
- `max-snippet:-1` — allow unlimited snippet length

To **prevent** a page from being indexed (e.g., a private dashboard), change to `noindex, nofollow`.

---

## 4. Verifying it works

| Tool | What to check |
|---|---|
| **Lighthouse** (Chrome DevTools → Lighthouse) | Run "Accessibility" + "SEO" audits — aim for 95+ |
| **axe DevTools** browser extension | Catches contrast, ARIA, and label issues |
| **WAVE** (wave.webaim.org) | Visual a11y feedback overlaid on the page |
| **Keyboard test** | Unplug your mouse — can you create, move, edit, and delete a task? |
| **Screen reader test** | macOS: ⌘F5 (VoiceOver). Windows: NVDA (free) |
| **Google Rich Results Test** | Validates the JSON-LD structured data |
| **Google Search Console** | Submit `sitemap.xml`, monitor index coverage |
| **`/robots.txt` checker** | Visit `https://yoursite.com/robots.txt` directly |

---

## 5. File reference

| File | Purpose |
|---|---|
| `index.html` | Title, meta description, OG/Twitter, canonical, JSON-LD, robots meta |
| `public/robots.txt` | Crawler rules + sitemap pointer |
| `public/sitemap.xml` | URL list for search engines |
| `src/components/jira/Board.tsx` | Semantic landmarks, ARIA, keyboard DnD, live region |
| `src/components/jira/TaskModal.tsx` | Dialog semantics, focus management, labeled inputs |
| `src/styles/dashboard.css` | `.sr-only`, `.skip-link`, focus rings, reduced-motion |

---

## 6. Quick checklist for future pages

- [ ] One `<h1>`, logical heading order
- [ ] Every input has a `<label>`
- [ ] Every interactive element reachable & operable by keyboard
- [ ] Visible focus ring (`:focus-visible`)
- [ ] All non-decorative images have `alt` text
- [ ] Decorative icons get `aria-hidden="true"`
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Unique `<title>` and meta description per route
- [ ] Canonical URL set
- [ ] Page added to `sitemap.xml`
- [ ] Lighthouse a11y + SEO score ≥ 95

---

*Last updated: April 30, 2026*

---

## 7. Canonical & Meta Tags — What They Are and Why They Matter

### 🤔 What is a canonical tag, in human language?

Imagine your website is a book. The same chapter can be printed in three different editions — hardcover, paperback, and digital. They all have the same words, but different ISBNs.

Google sees your page the same way. Your homepage might be reachable at:
- `yoursite.com/`
- `yoursite.com/?utm_source=twitter`
- `yoursite.com/index.html`

Without a canonical tag, Google thinks those are **three separate pages with identical content** and penalises you for "duplicate content" — splitting your ranking power across all three.

The canonical tag says: *"No matter which URL you arrived at, THIS is the one official version. Index only this one."*

```html
<link rel="canonical" href="https://yoursite.com/" />
```

| Part | What it means in plain English |
|------|--------------------------------|
| `<link>` | A relationship tag — it doesn't display anything, it just declares a relationship |
| `rel="canonical"` | The type of relationship: "this is the canonical (official) version" |
| `href="..."` | The exact URL Google should treat as the real one — always use the full `https://` address |

---

### 🤔 What is a meta tag, in human language?

A meta tag is a **note you leave for browsers and search engines inside `<head>`**. Visitors never see it — it's invisible on the page. But Google, Twitter, Facebook, and screen readers all read it.

Think of it like the label on a shipping box. The box contains your website. The label tells the delivery person (Google) what's inside, where it came from, and how to handle it — without them having to open the box.

---

### 🧩 The `SEOHead` component — line by line

We created `src/components/SEOHead.tsx` to manage all SEO tags dynamically. Here's every line explained:

#### The `upsertMeta` helper function

```ts
function upsertMeta(attr: string, value: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
```

| Line | What it does in plain English |
|------|-------------------------------|
| `document.querySelector(...)` | Looks inside `<head>` to see if a tag with this attribute already exists |
| `if (!el)` | If no existing tag was found... |
| `document.createElement('meta')` | ...create a brand-new `<meta>` element |
| `el.setAttribute(attr, value)` | Give it the right attribute (e.g. `name="description"`) |
| `document.head.appendChild(el)` | Drop it into `<head>` |
| `el.setAttribute('content', content)` | Whether we found it or just created it, set/update the actual content value |

> 🧠 Why "upsert"? It's a database term: **up**date if exists, in**sert** if not. This prevents duplicate tags when React re-renders or the user navigates between pages.

---

#### Tag 1 — Page title

```ts
document.title = title
```

- This sets the **browser tab text** AND the **blue clickable headline** in Google search results
- Every page must have a **unique** title — Google uses it as the strongest signal for what the page is about
- Keep it under 60 characters or Google truncates it with `...`

---

#### Tag 2 — Meta description

```ts
upsertMeta('name', 'description', description)
```

This produces:
```html
<meta name="description" content="Jiraboard is a fast, accessible Kanban dashboard..." />
```

| Part | Plain English |
|------|---------------|
| `name="description"` | "This is the description tag" |
| `content="..."` | The actual summary text — shown in grey under the title in Google results |

- Not a direct ranking factor, but it **controls click-through rate** — a well-written description = more people click your link
- Keep it under 160 characters

---

#### Tag 3 — Canonical URL

```ts
let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
if (!canonicalEl) {
  canonicalEl = document.createElement('link')
  canonicalEl.setAttribute('rel', 'canonical')
  document.head.appendChild(canonicalEl)
}
canonicalEl.setAttribute('href', canonical)
```

- Finds the existing `<link rel="canonical">` tag (already in `index.html`) or creates one
- Updates its `href` to match the current page's URL
- This is the **most important tag for duplicate-content prevention** — without it, `/?utm_source=email` and `/` look like two different pages to Google

---

#### Tag 4 — Robots directive

```ts
upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1')
```

This produces:
```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
```

| Value | What it tells Google |
|-------|----------------------|
| `index` | "Please add this page to your search index" |
| `follow` | "Please follow the links on this page to discover more pages" |
| `max-image-preview:large` | "You can show a large image preview in search results" |
| `max-snippet:-1` | "You can show as much text preview as you want" (no character limit) |
| `noindex, nofollow` | "Skip this page entirely" — used for `/admin`, `/login`, private dashboards |

> 🧠 The `noIndex` prop on `<SEOHead>` lets you flip this per page: `<SEOHead noIndex={true} ... />` on any page you want hidden from Google.

---

#### Tags 5–10 — Open Graph (Facebook, LinkedIn, WhatsApp)

```ts
upsertMeta('property', 'og:title', title)
upsertMeta('property', 'og:description', description)
upsertMeta('property', 'og:url', canonical)
upsertMeta('property', 'og:image', ogImage)
upsertMeta('property', 'og:type', 'website')
upsertMeta('property', 'og:site_name', 'Jiraboard')
```

| Tag | What it controls |
|-----|------------------|
| `og:title` | The bold headline in the social preview card |
| `og:description` | The summary text under the headline in the card |
| `og:url` | The URL shown at the bottom of the card |
| `og:image` | The thumbnail/banner image in the card |
| `og:type` | The category — `website` for most pages, `article` for blog posts |
| `og:site_name` | Your brand name shown as a small label above the title in the card |

> 🧠 Without OG tags, Facebook/LinkedIn **guess** what to show — usually picking a random image and the wrong text. OG tags give you full control.

---

#### Tags 11–14 — Twitter Cards

```ts
upsertMeta('name', 'twitter:card', 'summary_large_image')
upsertMeta('name', 'twitter:title', title)
upsertMeta('name', 'twitter:description', description)
upsertMeta('name', 'twitter:image', ogImage)
```

| Tag | What it controls |
|-----|------------------|
| `twitter:card` | The card style — `summary_large_image` = big banner image (not a tiny thumbnail) |
| `twitter:title` | The headline on the Twitter preview card |
| `twitter:description` | The summary text on the card |
| `twitter:image` | The image shown on the card |

> 🧠 Twitter reads OG tags as a fallback, but having explicit `twitter:*` tags gives you more control and avoids edge cases.

---

#### The `useEffect` dependency array

```ts
}, [title, description, canonical, ogImage, noIndex])
```

- Tells React: *"Re-run all the tag-writing code whenever any of these values change"*
- So when a user navigates from `/` to `/about`, the tags automatically update to match the new page — no page reload needed
- Without this, all pages would show the homepage's tags

---

### 🧩 How `index.html` and `SEOHead` work together

```
1. Browser requests the page
2. Server sends index.html — static tags are already there (title, canonical, OG, etc.)
3. Google/social crawlers read these static tags immediately (before JS runs)
4. React loads → SEOHead runs → updates/overrides the tags with page-specific values
5. For the homepage, the values are the same — no visible change
6. For other pages (/about, /blog/...), SEOHead swaps in the correct tags
```

| Layer | Who reads it | When |
|-------|-------------|------|
| `index.html` static tags | Google, social crawlers, bots | Before JavaScript runs |
| `SEOHead` dynamic tags | Browser, users, SPA navigation | After React loads |

> 🛡️ This two-layer approach means your SEO works even if a crawler doesn't execute JavaScript — which many still don't.

---

### 🧩 How to use `SEOHead` on a new page

When you add a new route (e.g. `/about`), drop `<SEOHead>` at the top of that page component:

```tsx
import SEOHead from '../components/SEOHead'

export default function About() {
  return (
    <>
      <SEOHead
        title="About – Jiraboard"
        description="Learn about the team behind Jiraboard."
        canonical="https://yoursite.com/about"
      />
      {/* rest of the page */}
    </>
  )
}
```

For a page you want hidden from Google (e.g. a settings page):

```tsx
<SEOHead
  title="Settings – Jiraboard"
  description="Manage your account settings."
  canonical="https://yoursite.com/settings"
  noIndex={true}
/>
```

---

### 🎯 Summary — why all of this matters

| Tag | Problem it solves |
|-----|-------------------|
| `canonical` | Stops Google penalising you for the same page appearing at multiple URLs |
| `description` | Controls the summary text in search results — affects how many people click your link |
| `robots` | Tells Google exactly what to do with each page — index it, skip it, or show rich previews |
| `og:*` | Controls how your link looks when shared on Facebook, LinkedIn, WhatsApp |
| `twitter:*` | Controls how your link looks when shared on Twitter/X |
| `SEOHead` component | Makes all of the above **per-page** and **automatic** — no manual `<head>` editing needed |

> 🎯 **One-line summary:** Meta tags are notes you leave for Google and social platforms. The canonical tag is the most important one — it tells Google which URL is the "real" version of a page, preventing duplicate-content penalties that hurt your ranking.

---

*Last updated: May 1, 2026 — Canonical & Meta Tags section added.*

---

## 8. `public/manifest.json` — line by line

### 🤔 What is manifest.json, in human language?

It is the **ID card of your web app**. When a user clicks "Install App" or "Add to Home Screen", the browser reads this file to know what to call the app, what icon to show, what colour the title bar should be, and how the app window should look.

Without it, the browser treats your site as just a website — not an installable app.

---

### 🧩 Every field explained

```json
"name": "Jiraboard – Kanban Project Dashboard"
```
The **full name** of your app. Shown in:
- The install prompt dialog: *"Install Jiraboard – Kanban Project Dashboard?"*
- The splash screen while the app is loading
- App store listings if you publish via PWA Builder

---

```json
"short_name": "Jiraboard"
```
The **short name** — used when there is not enough space for the full name. For example, the label under an Android home screen icon has limited space, so "Jiraboard" is shown instead of the full name. Keep it under 12 characters.

---

```json
"description": "Fast, accessible Kanban dashboard..."
```
A plain English description of what your app does. Used by app stores, search engines, and accessibility tools to understand the app's purpose.

---

```json
"start_url": "/"
```
The URL that opens when the user **launches the installed app** from their home screen or desktop. `/` means the homepage. You could set this to `/dashboard` if you want the app to skip a landing page and open directly on the board.

---

```json
"display": "standalone"
```
The **fallback display mode** — how the app window looks if `display_override` (below) is not supported by the browser. `standalone` means:
- No browser address bar
- No browser back/forward buttons
- Looks and feels like a native app

---

```json
"display_override": ["window-controls-overlay", "standalone", "minimal-ui"]
```
A **priority list** of display modes. The browser tries each one from left to right and uses the first it supports. Think of it as: *"Try my first choice, if not supported try second, then third."*

| Value | What it does | Supported on |
|-------|-------------|-------------|
| `window-controls-overlay` | Removes the default title bar completely. Your `theme_color` blue fills the entire top of the window. The OS close/minimise/maximise buttons float over your content. Makes the app look truly native. | Chrome/Edge desktop only |
| `standalone` | Normal installed-app look — no browser chrome, but keeps the standard OS title bar | All modern browsers |
| `minimal-ui` | Shows just a tiny toolbar with a back button. Last resort fallback. | Most browsers |

---

```json
"protocol_handlers": [
  {
    "protocol": "web+jiraboard",
    "url": "/?protocol=%s"
  }
]
```
This registers your app as the **handler for a custom URL protocol**. Once installed, if someone clicks a link like `web+jiraboard://board/sprint-24` anywhere on the web, the OS opens your PWA instead of a browser tab.

Real-world analogy: when you click a `mailto:` link, your email app opens. When you click a `spotify:` link, Spotify opens. This does the same for your app.

| Field | Plain English |
|-------|---------------|
| `protocol` | The custom protocol name. Must start with `web+` — browser security rule to stop apps hijacking built-in protocols like `https://` |
| `url` | The page inside your app that handles the incoming link. `%s` is a placeholder the browser replaces with the full protocol URL. So `web+jiraboard://board/sprint-24` opens your app at `/?protocol=web+jiraboard://board/sprint-24` |

---

```json
"background_color": "#ffffff"
```
The colour shown on the **splash screen** while the app is loading — the screen users see for ~1–2 seconds between tapping the icon and the app fully rendering. White matches the app's background so there's no jarring colour flash.

---

```json
"theme_color": "#0052cc"
```
The colour of the **browser toolbar / title bar / status bar**:
- On Android Chrome, this colours the top status bar to match your brand
- On desktop with `window-controls-overlay`, this fills the custom title bar area
- Must match `<meta name="theme-color">` in `index.html` — they work together

---

```json
"icons": [...]
```
The list of app icons the OS can use. Each icon is listed **twice** — once for `any` and once for `maskable` — because they serve different purposes:

| `purpose` | What it means | When it's used |
|-----------|--------------|----------------|
| `any` | Use the icon as-is, no cropping | Desktop browsers, older Android, Windows taskbar |
| `maskable` | The OS is allowed to crop this icon into a circle or squircle shape. The logo must sit inside the centre 80% of the image (the "safe zone") so the crop never cuts into it | Modern Android home screens |

Why list them separately? Because combining them as `"any maskable"` in one entry forces the browser to use the same image for both — the padding needed for maskable makes the icon look too small for `any`, and vice versa. Separate entries let the browser pick the right one for each context.

Why two sizes (192 and 512)?
- `192x192` — Android home screen, app drawer, smaller displays
- `512x512` — Splash screen, high-DPI displays, Play Store listing

---

```json
"screenshots": [...]
```
Preview images shown in the **install prompt**. When a user is about to install your PWA, Chrome shows a mini preview of what the app looks like — like an app store listing. Without screenshots, the install prompt is a plain boring dialog. With screenshots, it shows a rich card with app previews.

| Field | Plain English |
|-------|---------------|
| `src` | Path to the screenshot image |
| `sizes` | Pixel dimensions — tells the browser the aspect ratio of the preview |
| `type` | File format — always declare so the browser doesn't have to guess |
| `label` | A human-readable description for accessibility tools |
| `form_factor: "wide"` | Marks this as a **desktop** screenshot. Without it, the browser treats it as mobile. You need at least one `wide` screenshot to unlock the richer install UI on desktop, and at least one without `form_factor` (or with a non-wide value) to unlock it on mobile |

---

### 🎯 Summary — what each field controls

| Field | Controls |
|-------|----------|
| `name` / `short_name` | What the app is called in the install prompt and on the home screen |
| `start_url` | Which page opens when the app is launched |
| `display` / `display_override` | How the app window looks — from full native feel to minimal browser UI |
| `protocol_handlers` | Lets your app open when custom `web+` links are clicked anywhere |
| `background_color` | The splash screen colour while the app loads |
| `theme_color` | The title bar / status bar colour |
| `icons` | The icon shown on home screen, taskbar, splash screen |
| `screenshots` | The preview images shown in the install prompt |

---

*Last updated: May 1, 2026 — manifest.json section added.*
