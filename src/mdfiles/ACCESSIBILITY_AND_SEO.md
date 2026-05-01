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
