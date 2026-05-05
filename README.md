# Jiraboard — Kanban Project Dashboard

A fast, accessible, Jira-style Kanban board built with React 19, TypeScript, and Vite. Manage tasks across four columns with drag-and-drop, keyboard navigation, search, filters, and full screen-reader support — all persisted to `localStorage` with no backend required.

---

## ✨ Features

- **Kanban Board** — four columns: To Do, In Progress, In Review, Done
- **Drag and Drop** — mouse drag between and within columns with precise card insertion
- **Keyboard DnD** — full keyboard drag: `Space` to pick up, `Arrow` keys to move, `Space` to drop
- **Create / Edit / Delete** tasks via a modal form
- **Search** — filter tasks by title or ticket key (e.g. `PRJ-3`)
- **Filters** — filter by assignee and priority
- **Persistence** — tasks saved to `localStorage`, survive page refresh
- **PWA Ready** — installable, manifest, icons, screenshots, offline-capable
- **Accessibility** — WCAG 2.1 AA: skip link, focus management, ARIA live regions, screen reader announcements
- **SEO** — canonical tag, Open Graph, Twitter Cards, structured data, sitemap, robots.txt

---

## 🖥️ Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Dev server + production bundler |
| React Router DOM | 7 | Client-side routing |
| ESLint | 10 | Linting |

No external UI library. No state management library. No backend.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
# Clone the repo
git clone <your-repo-url>
cd jira-dashboard

# Install dependencies
npm install

# Start the dev server (opens at http://localhost:5173)
npm run dev
```

### All available commands

```bash
npm run dev        # Start dev server with HMR at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Serve the production build locally at localhost:4173
npm run lint       # Run ESLint
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

---

## 📁 Project Structure

```
jira-dashboard/
├── public/
│   ├── manifest.json          # PWA manifest — name, icons, display mode
│   ├── robots.txt             # Crawler rules — allows search bots, blocks AI scrapers
│   ├── sitemap.xml            # URL map for search engines
│   ├── icon-192.png           # PWA icon (home screen)
│   ├── icon-512.png           # PWA icon (splash screen)
│   ├── screenshot-mobile.png  # PWA install prompt preview (mobile)
│   └── screenshot-desktop.png # PWA install prompt preview (desktop)
│
├── src/
│   ├── pages/
│   │   ├── Board.tsx          # Root page — composes the entire board
│   │   ├── BoardColumn.tsx    # Single Kanban column with drop zone
│   │   ├── TaskCard.tsx       # Individual task card with drag handles
│   │   ├── TaskModal.tsx      # Create / Edit modal form
│   │   ├── TopBar.tsx         # Search bar + filters + Create button
│   │   ├── Sidebar.tsx        # Left navigation sidebar
│   │   └── NotFound.tsx       # 404 page (lazy loaded)
│   │
│   ├── hooks/
│   │   ├── useTasks.ts        # All task state: CRUD, filters, persistence, announcements
│   │   └── useDragAndDrop.ts  # Mouse + keyboard drag-and-drop interaction logic
│   │
│   ├── schema/
│   │   └── types.ts           # TypeScript types + constants (columns, assignees, priorities)
│   │
│   ├── styles/
│   │   └── dashboard.css      # All styles — board layout, cards, modal, accessibility
│   │
│   ├── mdfiles/               # Learning documentation
│   │   ├── ACCESSIBILITY_AND_SEO.md
│   │   ├── CODE_SPLITTING_AND_LAZY_LOADING.md
│   │   ├── DRAG_AND_DROP_EXPLAINED.md
│   │   └── ROBOTS_AND_INDEXING_INTERVIEW.md
│   │
│   ├── App.tsx                # Router setup — BrowserRouter + Routes
│   ├── main.tsx               # React entry point
│   └── utils.ts               # Helpers: seed data, avatar colours, task key generator
│
├── index.html                 # HTML shell — meta tags, OG, canonical, JSON-LD
├── vite.config.ts             # Vite config — aliases, chunk splitting, HMR, build output
├── tsconfig.app.json          # TypeScript config for src/
└── package.json
```

---

## 🗂️ Data Model

Every task on the board is a `Task` object:

```ts
interface Task {
  id: string        // UUID — internal identifier
  key: string       // Human-readable ticket key e.g. "PRJ-4"
  title: string     // Required — the task summary
  description?: string
  priority: "highest" | "high" | "medium" | "low" | "lowest"
  type: "task" | "bug" | "story"
  assignee: string  // One of the five team members
  column: "todo" | "inprogress" | "review" | "done"
}
```

Tasks are stored as a JSON array in `localStorage` under the key `jira-dashboard-tasks-v1`. On first visit, 7 seed tasks are generated so the board is never empty.

---

## 🏗️ Architecture

The app follows a clean separation of concerns across three layers:

```
Board.tsx  (UI — renders columns, wires up modal)
    │
    ├── useTasks.ts       (Data layer — owns all task state, CRUD, filters, persistence)
    └── useDragAndDrop.ts (Interaction layer — owns drag state, delegates moves to useTasks)
```

**`useTasks`** is the single source of truth for all task data. `Board.tsx` never touches task state directly — it only calls the functions returned by the hook. This keeps `Board.tsx` small (~85 lines) and makes the data logic independently testable.

**`useDragAndDrop`** owns zero data. It only tracks which card is being dragged and calls `moveTask` / `reorderTask` from `useTasks` when a drop happens. Swapping the storage layer would require zero changes to this file.

---

## ♿ Accessibility

This project targets **WCAG 2.1 AA**. Key implementations:

| Feature | Implementation |
|---------|---------------|
| Skip link | `<a href="#main-content">` — visible on focus, bypasses sidebar |
| Keyboard DnD | `Space` pick up → `Arrow` keys move → `Space` drop → `Escape` cancel |
| Screen reader announcements | `aria-live="polite"` region narrates every create/edit/delete/move |
| Focus management | Modal traps focus on open, returns focus to trigger on close |
| Semantic HTML | `<main>`, `<aside>`, `<nav>`, `<ul>/<li>` for card lists |
| Form labels | Every input has an explicit `<label htmlFor>` with `useId()` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all animations |
| Colour contrast | All text/background pairs meet 4.5:1 AA ratio |

---

## 🔍 SEO & PWA

### SEO (`index.html`)
- `<title>` and `<meta name="description">` — optimised for search results
- `<link rel="canonical">` — prevents duplicate-content penalties
- Open Graph tags — controls Facebook / LinkedIn / WhatsApp link previews
- Twitter Card tags — controls Twitter / X link previews
- JSON-LD structured data — `WebApplication` schema for rich search results
- `<meta name="robots">` — `index, follow, max-image-preview:large`

### Crawling (`public/robots.txt` + `public/sitemap.xml`)
- Allows Googlebot, Bingbot, social preview bots
- Blocks AI training scrapers (`GPTBot`, `CCBot`, `ClaudeBot`)
- Blocks `/api/` and `*.json` endpoints
- Points crawlers to `sitemap.xml`

### PWA (`public/manifest.json`)
- Installable on desktop and mobile
- `display_override: ["window-controls-overlay", "standalone"]` — custom title bar on Chrome desktop
- `protocol_handlers` — registers `web+jiraboard://` custom protocol
- Separate `any` and `maskable` icons — correct display on all Android shapes
- Mobile + desktop screenshots — unlocks rich install prompt UI

---

## ⚙️ Vite Configuration Highlights

```ts
// Path alias — use @/ instead of ../../
resolve: { alias: { '@': resolve(__dirname, 'src') } }

// Chunk splitting — vendor libraries cached separately from app code
manualChunks(id) {
  if (id.includes('node_modules/react'))        return 'vendor-react'
  if (id.includes('node_modules/react-router')) return 'vendor-router'
  if (id.includes('node_modules/'))             return 'vendor'
}

// Organised output — assets sorted into js/ css/ png/ svg/ subfolders
chunkFileNames: 'assets/js/[name]-[hash].js'
assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'

// Windows-reliable HMR
server: { watch: { usePolling: true } }
```

---

## 📖 Documentation

The `src/mdfiles/` folder contains in-depth learning notes written alongside this project:

| File | Covers |
|------|--------|
| `ACCESSIBILITY_AND_SEO.md` | Every a11y and SEO decision explained line by line |
| `CODE_SPLITTING_AND_LAZY_LOADING.md` | React.lazy, Suspense, Webpack vs Vite deep dive |
| `DRAG_AND_DROP_EXPLAINED.md` | HTML5 DnD API, keyboard DnD, accessibility patterns |
| `ROBOTS_AND_INDEXING_INTERVIEW.md` | robots.txt, sitemap.xml, crawling vs indexing |

---

## 🗺️ Roadmap

- [ ] Add more routes (Profile, Settings, Reports)
- [ ] Replace `localStorage` with a real backend / Supabase
- [ ] Add unit tests for `useTasks` and `useDragAndDrop`
- [ ] Dark mode support
- [ ] Drag-and-drop between multiple boards

---

*Built with React 19 + TypeScript + Vite — May 2026*
