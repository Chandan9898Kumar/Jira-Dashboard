# package.json — Every Field Explained

`package.json` is the **identity card + instruction manual** of your project.
It tells Node, npm, your teammates, and deployment tools everything they need
to know about the project — what it is, who made it, what it needs to run,
and what commands are available.

Without it, npm has no idea what your project is or how to run it.

---

## The Full File

```json
{
  "name": "jira-dashboard",
  "version": "1.0.0",
  "description": "Fast, accessible Kanban project dashboard...",
  "private": true,
  "type": "module",
  "author": "Jiraboard",
  "license": "MIT",
  "homepage": "https://yoursite.com",
  "keywords": ["kanban", "react", "pwa", ...],
  "engines": { "node": ">=18.0.0", "npm": ">=9.0.0" },
  "browserslist": ["last 2 Chrome versions", ...],
  "scripts": { ... },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

---

## Identity Fields

---

### `name`

```json
"name": "jira-dashboard"
```

**What it is:** The unique name of your project.

**Why we wrote it:** npm uses this as the package identifier. If you ever
publish to npm, this is the name people would use to install it
(`npm install jira-dashboard`). Even for private projects, it's used
in error messages, logs, and CI pipelines to identify which project
is running.

**Rule:** Lowercase only, no spaces, hyphens allowed.

---

### `version`

```json
"version": "1.0.0"
```

**What it is:** The current version of your app following **Semantic Versioning**
(`major.minor.patch`).

**Why we wrote it:** Tools like npm, GitHub releases, and deployment pipelines
use this to track what version is running where. It also helps you communicate
changes to your team.

**How the three numbers work:**

| Number | When to change it | Example |
|--------|------------------|---------|
| `major` (1) | Breaking change — something old no longer works | `1.0.0` → `2.0.0` |
| `minor` (0) | New feature added, nothing broken | `1.0.0` → `1.1.0` |
| `patch` (0) | Bug fix, no new features | `1.0.0` → `1.0.1` |

**We changed it from `"0.0.0"`** because `0.0.0` means "not started yet".
The app is built and working — `1.0.0` is the correct starting point.

---

### `description`

```json
"description": "Fast, accessible Kanban project dashboard with drag-and-drop, search, filters and PWA support."
```

**What it is:** A one-line summary of what the project does.

**Why we wrote it:** Shows up in:
- `npm info jira-dashboard` output
- GitHub repository description
- npm search results if ever published
- Any tool that reads `package.json` to understand the project

Without it, anyone looking at the project for the first time has no idea
what it does without reading the code.

---

### `private`

```json
"private": true
```

**What it is:** A safety flag that prevents the package from being
accidentally published to the public npm registry.

**Why we wrote it:** This is a private project — it should never appear
on `npmjs.com`. If you accidentally run `npm publish` without this flag,
your entire source code becomes publicly downloadable by anyone in the world.
`"private": true` makes npm refuse to publish it and shows an error instead.

**Think of it as:** A lock on the "publish" button.

---

### `type`

```json
"type": "module"
```

**What it is:** Tells Node.js which module system to use for `.js` files.

**Why we wrote it:** There are two module systems in JavaScript:
- **CommonJS** (old): `const x = require('./file')` — Node's default
- **ES Modules** (modern): `import x from './file'` — what we use

Without `"type": "module"`, Node treats `.js` files as CommonJS and
`import` statements throw errors. With it, Node treats `.js` files as
ES Modules and `import`/`export` work correctly.

Vite requires this to be set for modern React projects.

---

### `author`

```json
"author": "Jiraboard"
```

**What it is:** Who built the project.

**Why we wrote it:** Shows up in npm listings, GitHub, and license files.
For a team project you'd write:
```json
"author": {
  "name": "Your Name",
  "email": "you@example.com",
  "url": "https://yoursite.com"
}
```

---

### `license`

```json
"license": "MIT"
```

**What it is:** The legal terms under which others can use your code.

**Why we wrote it:** Without a license, your code is legally **all rights
reserved** by default — nobody is allowed to use, copy, or modify it,
even if it's public on GitHub. A license makes your intentions clear.

**MIT** is the most permissive open-source license:
- Anyone can use, copy, modify, and distribute the code
- They just have to keep your copyright notice
- You're not liable for anything

**Other common licenses:**

| License | What it means |
|---------|--------------|
| MIT | Do whatever you want, just keep my name |
| Apache 2.0 | Like MIT but also grants patent rights |
| GPL | You can use it but your project must also be open source |
| ISC | Simpler version of MIT, same effect |

---

### `homepage`

```json
"homepage": "https://id-preview--3442eccc-4121-4ae6-8dbf-4466418a15e4.lovable.app"
```

**What it is:** The URL where the live app is running.

**Why we wrote it:** Used by:
- npm to show a link to the running app
- GitHub to display a website link on the repo page
- Some deployment tools to know where to point traffic

Update this to your real domain when you go live.

---

### `keywords`

```json
"keywords": ["kanban", "jira", "project-management", "react", "typescript", "pwa", "drag-and-drop"]
```

**What it is:** An array of tags describing the project.

**Why we wrote it:** Used by npm search to help people find your package.
Also used by GitHub topics. If you search npm for "kanban react", packages
with those keywords appear in results.

For a private project it's less critical, but it's good documentation —
a new developer joining the team immediately understands the tech stack
and purpose just from reading these tags.

---

## Environment Requirements

---

### `engines`

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

**What it is:** The minimum versions of Node.js and npm required to run
this project.

**Why we wrote it:** Without this, a developer could clone the repo,
run `npm install`, and get a cryptic error 10 steps later because they're
on Node 14 and the project uses features only available in Node 18+.

With `engines`, npm warns them immediately:
```
npm warn EBADENGINE Unsupported engine {
  required: { node: '>=18.0.0' },
  current: { node: '14.0.0' }
}
```

They know exactly what to fix before wasting time debugging.

**How to check your current Node version:**
```bash
node --version   # should be v18.0.0 or higher
npm --version    # should be 9.0.0 or higher
```

---

### `browserslist`

```json
"browserslist": [
  "last 2 Chrome versions",
  "last 2 Firefox versions",
  "last 2 Safari versions",
  "last 2 Edge versions"
]
```

**What it is:** A list of browsers your app needs to support.

**Why we wrote it:** Vite reads this when building for production and
decides:
- Which modern JavaScript features need to be converted to older syntax
  (transpilation)
- Which CSS properties need vendor prefixes (`-webkit-`, `-moz-` etc.)
- How aggressively to optimise the output

**Without it:** Vite makes its own assumptions — usually targeting too
many old browsers, making your bundle larger than it needs to be.

**With it:** Vite knows you only care about the last 2 versions of modern
browsers, so it can use modern JS features directly without polyfills,
resulting in a smaller, faster bundle.

**Real example:**
```
Without browserslist: bundle includes polyfills for IE11 → +50KB
With browserslist:    no IE11 polyfills needed → bundle stays small
```

**"last 2 versions" means:**
If Chrome is currently on version 124, this targets versions 123 and 124.
Old versions are ignored — users on Chrome 80 would need to update.

---

## Scripts

Scripts are shortcuts. Instead of typing a long command, you type
`npm run <name>` and npm runs the full command for you.

---

### `dev`

```json
"dev": "vite"
```

**What it does:** Starts the Vite development server at `localhost:5173`.

**How it works:** Vite watches your files for changes and hot-reloads
the browser instantly when you save. This is what you run while coding.

```bash
npm run dev
```

---

### `build`

```json
"build": "tsc -p tsconfig.app.json --noEmit && vite build"
```

**What it does:** Two steps chained together with `&&`:

**Step 1 — `tsc -p tsconfig.app.json --noEmit`**
Runs the TypeScript compiler to check for type errors.
`--noEmit` means "check but don't produce any output files — just tell
me if there are errors."

If there are TypeScript errors → the `&&` stops here, `vite build` never runs.
This catches bugs before they reach production.

**Step 2 — `vite build`**
Only runs if TypeScript passed. Bundles your app into optimised files
in the `dist/` folder — minified, hashed, split into chunks.

**Why we changed it from just `vite build`:**
The old version ignored TypeScript errors during build. You could have
broken types and still get a production build. Now type errors block
the build — no broken code ships.

```bash
npm run build
```

---

### `build:dev`

```json
"build:dev": "vite build --mode development"
```

**What it does:** Builds the app but in development mode — no minification,
readable file names, source maps included.

**Why it exists:** Useful when you want to inspect the built output without
it being minified and unreadable. Also useful for debugging production-only
bugs in a readable format.

```bash
npm run build:dev
```

---

### `preview`

```json
"preview": "vite preview"
```

**What it does:** Serves the production build (`dist/` folder) locally
at `localhost:4173`.

**Why it exists:** `npm run dev` serves your source files directly.
`npm run preview` serves the actual built output — the same files a
real user would download. Use this to test the service worker, PWA
install prompt, and production performance before deploying.

**Important:** Always run `npm run build` before `npm run preview`.
Preview serves whatever is in `dist/` — if you haven't built recently,
you're previewing old code.

```bash
npm run build
npm run preview
```

---

### `lint`

```json
"lint": "eslint . --max-warnings 0"
```

**What it does:** Runs ESLint across every file in the project and
reports any code quality issues.

**What `--max-warnings 0` means:**
Without this flag, warnings are allowed — only errors fail the check.
With `--max-warnings 0`, even a single warning fails the lint check.

**Why we added it:** Warnings are easy to ignore and pile up over time.
`--max-warnings 0` forces you to fix every warning immediately, keeping
the codebase clean.

```bash
npm run lint
```

---

### `lint:fix`

```json
"lint:fix": "eslint . --fix"
```

**What it does:** Same as `lint` but automatically fixes every issue
that ESLint knows how to fix — missing semicolons, wrong quote style,
unused imports, etc.

**Why it exists:** Instead of manually fixing 20 lint warnings one by one,
one command fixes them all instantly.

**What it can't fix:** Logic errors, complex issues that require human
judgement. Those still need manual fixing.

```bash
npm run lint:fix
```

---

### `type-check`

```json
"type-check": "tsc -p tsconfig.app.json --noEmit"
```

**What it does:** Runs TypeScript type checking without building anything.
Just checks if your types are correct and reports errors.

**Why it exists:** Sometimes you want to quickly check if your types are
correct without doing a full build. Also useful in CI pipelines where
you want type checking as a separate step from building.

**`--noEmit` explained:**
TypeScript normally compiles `.ts` files into `.js` files. `--noEmit`
says "just check for errors, don't produce any output files." It's a
pure validation step.

```bash
npm run type-check
```

---

### `test`

```json
"test": "vitest run"
```

**What it does:** Runs all test files once and exits.

**`vitest run` vs `vitest`:**
- `vitest run` — runs tests once, exits. Used in CI pipelines.
- `vitest` (watch mode) — keeps running, re-runs tests when files change.

```bash
npm run test
```

---

### `test:watch`

```json
"test:watch": "vitest"
```

**What it does:** Runs tests in watch mode — stays running and
automatically re-runs relevant tests whenever you save a file.

**Why it exists:** While writing a new feature or fixing a bug, you want
instant feedback on whether your tests pass after every change. Watch
mode gives you that without manually running tests each time.

```bash
npm run test:watch
```

---

### `test:coverage`

```json
"test:coverage": "vitest run --coverage"
```

**What it does:** Runs all tests and generates a **coverage report** —
a breakdown of which lines of your code are actually executed by tests
and which are not.

**What coverage means:**
```
src/utils.ts        → 85% covered  (85% of lines run during tests)
src/hooks/useTasks  → 60% covered  (40% of lines never tested)
```

**Why it matters:** High coverage doesn't guarantee bug-free code, but
low coverage tells you which parts of the app have no safety net. If
`useTasks.ts` is 0% covered and you change it, you have no automated
way to know if you broke something.

```bash
npm run test:coverage
```

---

## Dependencies vs devDependencies

---

### `dependencies`

```json
"dependencies": {
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.2"
}
```

**What it is:** Packages your app needs to actually RUN in production.

**Why these three:**
- `react` — the core React library, the engine of the UI
- `react-dom` — connects React to the browser's DOM (`createRoot`)
- `react-router-dom` — handles URL routing (`BrowserRouter`, `Routes`, `Route`)

These get included in the production bundle that users download.

---

### `devDependencies`

```json
"devDependencies": {
  "@vitejs/plugin-react": "...",
  "typescript": "...",
  "eslint": "...",
  "vite": "..."
}
```

**What it is:** Packages only needed during development and building —
not in the final app users download.

**Why the split matters:**
When you run `npm install --production`, devDependencies are skipped.
This keeps production servers lean — they don't need ESLint or TypeScript
to serve your app.

| Package | Why it's a devDependency |
|---------|--------------------------|
| `vite` | Only needed to build the app, not to run it |
| `typescript` | Only needed to compile, not at runtime |
| `eslint` | Only needed during development |
| `@types/*` | TypeScript type definitions, stripped at build time |

---

## The `^` and `~` Version Symbols

You'll see these in front of version numbers:

```json
"react": "^19.2.5"
"typescript": "~6.0.2"
```

| Symbol | Meaning | Example |
|--------|---------|---------|
| `^` (caret) | Allow minor and patch updates | `^19.2.5` accepts `19.3.0`, `19.2.9` but NOT `20.0.0` |
| `~` (tilde) | Allow patch updates only | `~6.0.2` accepts `6.0.9` but NOT `6.1.0` |
| No symbol | Exact version only | `19.2.5` only ever installs exactly `19.2.5` |

**Why TypeScript uses `~` instead of `^`:**
TypeScript minor versions sometimes introduce breaking changes in type
checking. `~` keeps it on patch updates only — safer for a type checker.

---

## Summary

| Field | One-line purpose |
|-------|-----------------|
| `name` | Project identifier for npm and tools |
| `version` | Current release number — bump on every deploy |
| `description` | What the project does — shown in npm and GitHub |
| `private` | Prevents accidental publish to npm |
| `type` | Tells Node to use ES Modules (`import`) not CommonJS (`require`) |
| `author` | Who built it |
| `license` | Legal terms for using the code |
| `homepage` | URL of the live app |
| `keywords` | Tags for search and discovery |
| `engines` | Minimum Node/npm versions required |
| `browserslist` | Which browsers to target — affects bundle size |
| `scripts` | Shortcut commands run with `npm run <name>` |
| `dependencies` | Packages needed in production |
| `devDependencies` | Packages needed only during development |

---

*Last updated: May 1, 2026 — package.json documentation*
