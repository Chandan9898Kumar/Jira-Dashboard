# 🎤 Robots.txt & Indexing — Interview Q&A Guide

A complete, interview-style guide written in **simple human language**.
Read it like a conversation between an **Interviewer (Q)** and **You (A)**.

> Use this as both a study sheet and a real interview cheat-sheet.
> Every answer ends with a small example so you can repeat it confidently.

---

## 📚 Table of Contents

1. [Part 1 — robots.txt](#part-1--robotstxt)
2. [Part 2 — Indexing](#part-2--indexing)
3. [Part 3 — Tricky / Follow-up Questions](#part-3--tricky--follow-up-questions)
4. [Part 4 — Quick Revision Cheat Sheet](#part-4--quick-revision-cheat-sheet)
5. [Part 5 — How this project implements it](#part-5--how-this-project-implements-it)

---

# Part 1 — robots.txt

---

### ❓ Q1. What is `robots.txt`?

**A (simple answer):**
`robots.txt` is a **plain text file** that lives at the **root of your website** (for example `https://mysite.com/robots.txt`).
It tells **search engine bots** (like Googlebot, Bingbot) **which pages they are allowed to visit and which pages they should stay away from**.

Think of it like a **"Welcome" board at the entrance of a shopping mall**:
> "Customers welcome in all shops. Staff-only area on the 3rd floor — please don't enter."

The bots **read this file first** before crawling anything else on your site.

**Mini example:**
```
User-agent: *
Disallow: /admin/
Allow: /
```
Translation → "Hey every bot, you can crawl everything **except** the `/admin/` folder."

---

### ❓ Q2. Why do we use `robots.txt`?

**A:** We use it for **4 main reasons**:

1. **Save server resources** — Bots crawl thousands of pages. Blocking useless pages (like `/cart`, `/search?q=...`) saves bandwidth.
2. **Hide non-public pages from search results** — admin panels, internal APIs, thank-you pages.
3. **Avoid duplicate content** — block filter URLs like `?sort=price&color=red` that show the same products.
4. **Point bots to the sitemap** — so Google finds all your important pages quickly.

**Real-life analogy:**
A library has a sign: *"Reference books on floor 1, novels on floor 2, staff room — do not enter."* That sign is the library's `robots.txt`.

---

### ❓ Q3. How does `robots.txt` actually work? (Step-by-step)

**A:**

1. A bot (e.g. Googlebot) wants to crawl `https://mysite.com/products`.
2. **Before** doing anything, it requests `https://mysite.com/robots.txt`.
3. It reads the rules in that file.
4. If the rules say `Disallow: /products`, the bot **skips** the page.
5. If the rules say `Allow: /` (or there's no rule), it crawls normally.
6. The bot also notes any `Sitemap:` line and fetches the sitemap to discover more URLs.

**Important point to mention in interview:**
> "robots.txt is a **request, not a wall**. Well-behaved bots (Google, Bing) obey it. Bad bots (scrapers, hackers) can simply ignore it. So we **never** use robots.txt for security — only for crawl management."

---

### ❓ Q4. Where should `robots.txt` be placed?

**A:** Always at the **root of the domain**:
- ✅ `https://mysite.com/robots.txt`
- ❌ `https://mysite.com/files/robots.txt` (won't work)
- ❌ `https://mysite.com/blog/robots.txt` (won't work)

It must be served as **plain text** with status code **200 OK**.

---

### ❓ Q5. Explain the syntax of `robots.txt` with an example.

**A:** It uses 4 main directives:

| Directive | Meaning |
|---|---|
| `User-agent:` | Which bot the rule applies to (`*` = all bots) |
| `Disallow:` | Path the bot **must not** crawl |
| `Allow:` | Path the bot **is allowed** to crawl (overrides Disallow) |
| `Sitemap:` | Full URL of your sitemap |

**Full example:**
```
# Rule 1: All bots
User-agent: *
Disallow: /admin/
Disallow: /cart
Allow: /

# Rule 2: Block one specific bad bot
User-agent: BadBot
Disallow: /

# Rule 3: Help search engines
Sitemap: https://mysite.com/sitemap.xml
```

**Plain English:**
- All bots → don't go into `/admin/` or `/cart`, but everything else is fine.
- BadBot → not allowed anywhere.
- Sitemap is at this URL — please use it.

---

### ❓ Q6. What's the difference between `Disallow` and `noindex`?

**A:** This is a **classic interview trap question**.

| | `Disallow` (in robots.txt) | `noindex` (meta tag in HTML) |
|---|---|---|
| What it stops | **Crawling** (visiting the page) | **Indexing** (adding to search results) |
| Where it lives | `robots.txt` file | Inside the page's `<head>` |
| Example | `Disallow: /secret` | `<meta name="robots" content="noindex">` |
| Result | Google **doesn't visit** the page, but it might still appear in results (just without a description) | Google **visits** the page but **doesn't show** it in search |

**Key insight to say in interview:**
> "If you want a page to truly disappear from Google, use `noindex`, not `Disallow`. Because if you Disallow it, Google can't even read the noindex tag inside it!"

---

### ❓ Q7. Can `robots.txt` improve SEO?

**A:** Indirectly, yes. It doesn't *boost* rankings, but a good `robots.txt`:
- Lets Google **focus its crawl budget** on important pages.
- Prevents duplicate / low-value pages from diluting your site's quality score.
- Ensures the **sitemap is discovered**, which helps new pages get indexed faster.

---

# Part 2 — Indexing

---

### ❓ Q8. What is indexing?

**A (simple answer):**
**Indexing** is the process where a search engine **stores and organizes the pages it has crawled**, so it can show them later when someone searches.

**Analogy: A library.**
- **Crawling** = the librarian walks around picking up new books.
- **Indexing** = the librarian writes each book's title, author, and topic into a giant catalog.
- **Searching** = a visitor asks "Do you have books on cooking?" and the librarian instantly checks the catalog.

Without indexing, every search would have to read every book on Earth from scratch — **impossible**.

---

### ❓ Q9. Why do we need indexing?

**A:**
1. **Speed** — Searching billions of pages live would take hours. An index makes it instant.
2. **Discoverability** — If your page isn't indexed, **it doesn't exist** on Google. No one can find it.
3. **Ranking** — Google ranks pages **from its index**, not by visiting them live.
4. **Better user experience** — Search results in milliseconds.

**Killer line for interview:**
> "Being crawled is not enough — only **indexed** pages can appear in search results."

---

### ❓ Q10. How does indexing actually work? (Step-by-step)

**A:** There are **3 stages**: **Crawling → Indexing → Ranking**.

```
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ CRAWLING │ →  │ INDEXING │ →  │ RANKING  │
   └──────────┘    └──────────┘    └──────────┘
   Bot visits      Page is        Page is shown
   the page        analysed,      in search
                   stored in DB   results
```

**Detailed steps:**

1. **Crawling** — Googlebot fetches your HTML.
2. **Rendering** — It runs your JavaScript (important for React/Vite apps like this one).
3. **Parsing** — It extracts text, headings, images, links, structured data (JSON-LD).
4. **Analysing** — It figures out: language, topic, keywords, quality, mobile-friendliness.
5. **Storing** — It saves all this info in **Google's Index** (a massive database).
6. **Serving** — When a user searches, Google looks up the index, ranks matching pages, and returns the results.

---

### ❓ Q11. What things help a page get indexed faster?

**A:**
- ✅ A clean **`sitemap.xml`** submitted via Google Search Console.
- ✅ Internal links pointing to the page.
- ✅ External backlinks from trusted sites.
- ✅ Fast page load speed (Core Web Vitals).
- ✅ Mobile-friendly responsive design.
- ✅ Proper meta tags (`<title>`, `<meta description>`).
- ✅ Structured data (JSON-LD).
- ✅ Server returns HTTP **200 OK**, not 404 / 5xx.
- ✅ `<meta name="robots" content="index, follow">`.

---

### ❓ Q12. What can stop a page from being indexed?

**A:**
- ❌ `<meta name="robots" content="noindex">` in the HTML.
- ❌ Disallowed in `robots.txt` (Google can't even crawl to find content).
- ❌ Returns 404 / 410 / 5xx.
- ❌ Marked as duplicate via wrong canonical tag.
- ❌ Requires login (authenticated content).
- ❌ Very thin / low-quality content.
- ❌ Blocked by HTTP authentication or paywalls.

---

### ❓ Q13. What is a sitemap and how does it help indexing?

**A:**
A **sitemap** is an XML file listing all the public URLs of your website with extra hints (last modified date, priority, change frequency).

It's like giving Google a **table of contents** of your website.

**Mini example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mysite.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

**Why it's important for SPAs (like our React app):**
> Single Page Applications often have **no real `<a href>` links** between routes — the whole site renders client-side. Without a sitemap, Google might miss most of the pages. Sitemap solves this.

---

### ❓ Q14. Difference between Crawling and Indexing?

**A (most common interview question!):**

| | **Crawling** | **Indexing** |
|---|---|---|
| What it is | Visiting and downloading pages | Storing and organising the page's info |
| Done by | Crawler / Spider / Bot | Indexer (different program) |
| Output | Raw HTML | Searchable database entry |
| Analogy | Reading a book | Adding the book to the library catalog |
| Can happen without the other? | A page can be crawled but **not indexed** (e.g. has noindex) | A page **cannot** be indexed without being crawled first |

---

### ❓ Q15. How can I check if my page is indexed by Google?

**A:** Three easy ways:
1. **Google search:** type `site:mysite.com/page-url` — if it shows up, it's indexed.
2. **Google Search Console** → "URL Inspection" tool → paste your URL.
3. Check the page's `<meta name="robots">` tag — should contain `index`.

---

# Part 3 — Tricky / Follow-up Questions

---

### ❓ Q16. If I add `Disallow: /` in robots.txt, what happens?

**A:** You're telling **all bots to stay out of your entire website**.
The site will **gradually disappear from Google search results**.
🚨 This is a famous mistake — many companies have done it accidentally on production!

---

### ❓ Q17. Is robots.txt case-sensitive?

**A:** **Yes**, the paths are case-sensitive.
- `Disallow: /Admin/` will **not** block `/admin/`.

---

### ❓ Q18. What's the difference between `robots.txt`, the robots `<meta>` tag, and the `X-Robots-Tag` header?

**A:**
| Tool | Where it lives | Best for |
|---|---|---|
| `robots.txt` | A file at site root | Blocking **crawling** of folders / patterns |
| `<meta name="robots">` | Inside an HTML `<head>` | Controlling **indexing** of a single HTML page |
| `X-Robots-Tag` (HTTP header) | Server response header | Controlling indexing of **non-HTML files** like PDFs, images |

---

### ❓ Q19. Should I block JavaScript and CSS in robots.txt?

**A:** **No, never.** Google needs to load JS/CSS to **render the page properly**. Blocking them can cause Google to see a broken, unstyled page and rank you poorly.

---

### ❓ Q20. What is "crawl budget"?

**A:** The number of pages Googlebot will crawl on your site within a given time. Big sites (millions of pages) need to use `robots.txt` and sitemaps wisely so that Google spends its budget on **important** pages, not on filter URLs and duplicates.

---

### ❓ Q21. What are AI scrapers? (and why we block some in `robots.txt`)

**A (simple answer):**
**AI scrapers** are bots run by **AI companies** (OpenAI, Anthropic, Google AI, Common Crawl, etc.) that visit websites and **copy the content** to use as **training data** for their large language models (LLMs) like ChatGPT, Claude, or Gemini.

Think of a normal search bot like **Googlebot** as a **librarian** — it reads your book and tells people *"this book exists, here's where to find it"* (sends traffic back to you).

An **AI scraper** is more like a **photocopier** — it reads your book, copies it into its own brain, and then answers questions using your content **without sending visitors back to your site**.

---

#### 🧠 Why people block AI scrapers

| Reason | Plain explanation |
|--------|------------------|
| **No traffic back** | AI answers users directly — your site gets no visits, no ads, no revenue |
| **Copyright / IP** | Your blog posts, art, code may be used to train a commercial product without permission or payment |
| **Server cost** | Scrapers can hit your site aggressively and slow it down |
| **Privacy** | User-generated content (comments, reviews) may end up inside an AI model |

---

#### 🤖 Common AI scraper bot names (User-agents)

| User-agent | Who runs it | What it does |
|------------|-------------|--------------|
| `GPTBot` | OpenAI | Trains ChatGPT models |
| `ChatGPT-User` | OpenAI | Fetches pages live when ChatGPT browses for a user |
| `OAI-SearchBot` | OpenAI | Powers ChatGPT's search results |
| `ClaudeBot` / `anthropic-ai` | Anthropic | Trains Claude |
| `Google-Extended` | Google | Opt-out token for Gemini / Vertex AI training (Googlebot itself is separate!) |
| `CCBot` | Common Crawl | Massive open dataset used by **most** AI companies |
| `PerplexityBot` | Perplexity AI | Powers Perplexity answers |
| `Bytespider` | ByteDance / TikTok | Trains their AI models — known for being aggressive |
| `Applebot-Extended` | Apple | Opt-out token for Apple Intelligence training |
| `Meta-ExternalAgent` | Meta | Trains Llama / Meta AI |

---

#### 🛡️ How to block AI scrapers (example)

```txt
# Block OpenAI training
User-agent: GPTBot
Disallow: /

# Block Anthropic
User-agent: ClaudeBot
Disallow: /

# Block Common Crawl (used by many AI labs)
User-agent: CCBot
Disallow: /

# Opt out of Google's AI training (but keep Google Search!)
User-agent: Google-Extended
Disallow: /
```

> 💡 **Important nuance:** Blocking `Google-Extended` does **NOT** remove you from Google Search — `Googlebot` is a separate user-agent. Same idea for `Applebot-Extended` vs `Applebot`. This lets you say *"index me for search, but don't train AI on me."*

---

#### ⚠️ The honest truth

`robots.txt` is a **polite request**, not a wall. Well-behaved bots (OpenAI, Anthropic, Google) **do respect it**. But shady scrapers will **ignore it completely**. To truly stop them you need server-level blocks (Cloudflare AI bot blocking, IP firewalls, rate limits, WAF rules).

**Mini analogy:**
> `robots.txt` is a *"Please don't enter"* sign on an unlocked door. Most people respect it. Burglars don't. For burglars, you need a real lock — that's your **firewall / WAF**.

---

#### ✅ What this project does

In `public/robots.txt` we **block `GPTBot` and `CCBot`** as a starter. You can extend the list with `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `Bytespider`, etc. depending on your stance.

---

# Part 4 — Quick Revision Cheat Sheet

🔥 **Memorise this — it covers 90% of interview questions:**

```
robots.txt
  → File at site root
  → Tells bots what to crawl / not crawl
  → Syntax: User-agent / Disallow / Allow / Sitemap
  → Politeness contract, NOT security

Indexing
  → Storing crawled pages in a search engine's database
  → Without indexing → page is invisible on Google
  → Pipeline: Crawl → Render → Index → Rank → Serve

Crawling vs Indexing
  → Crawling = visiting
  → Indexing = remembering

To stop indexing → use <meta name="robots" content="noindex">
To stop crawling → use Disallow in robots.txt

Sitemap → A roadmap of all your URLs for search engines
```

---

# Part 5 — How this project implements it

This **Jiraboard** project already implements both concepts:

### 🤖 robots.txt — `public/robots.txt`
- Allows major search bots (Googlebot, Bingbot, DuckDuckBot).
- Allows social preview bots (Twitterbot, LinkedInBot, facebookexternalhit) — so link previews work.
- Blocks aggressive AI scrapers (GPTBot, CCBot).
- Blocks `/api/` and raw `.json` files for general bots.
- Points to the sitemap with the `Sitemap:` directive.

### 🗺️ Sitemap — `public/sitemap.xml`
- Lists the homepage with `<changefreq>weekly</changefreq>` and `<priority>1.0</priority>`.
- Add a new `<url>` block for every new public route.

### 🏷️ Indexing meta tags — `index.html`
```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="googlebot" content="index, follow" />
<link rel="canonical" href="https://.../" />
```
- `index, follow` → please index this page and follow its links.
- `max-image-preview:large` → allow big preview images in Google.
- `max-snippet:-1` → allow unlimited description snippet length.
- `canonical` → tells Google the "official" URL, preventing duplicate content issues.

### 📋 Structured data (JSON-LD)
A `WebApplication` schema is embedded in `index.html` so Google understands this site is a software tool — eligible for rich results.

---

## ✅ How to verify everything works

| Test | Tool |
|---|---|
| Is robots.txt reachable? | Visit `https://yoursite.com/robots.txt` |
| Is the sitemap valid? | Paste it into Google Search Console → "Sitemaps" |
| Is the page indexable? | Search Console → "URL Inspection" |
| Is structured data correct? | [Google Rich Results Test](https://search.google.com/test/rich-results) |
| Is the page already on Google? | Search `site:yoursite.com` |

---

# Part 6 — Line-by-Line Walkthrough (Plain-English)

This section explains **every single line** of the two files in this project, like a teacher reading them out loud. No jargon, just "what does this line do, and why is it there."

---

## 📄 6A. `public/robots.txt` — line by line

> 📂 Location: `public/robots.txt` → served at `https://yoursite.com/robots.txt`

### 🧩 The header comments

```txt
# robots.txt for Jiraboard
# ----------------------------------------------------
# Allow all well-behaved search & social crawlers
# ----------------------------------------------------
```

| Line | What it does | Why it's there |
|------|--------------|----------------|
| `# robots.txt for Jiraboard` | A **comment** — anything after `#` is ignored by bots | Helps a human (you, your team) instantly know what file they're reading |
| `# -----...` and `# Allow all...` | More comments — section divider + label | Organises the file into clear sections so it's easy to maintain later |

> 💡 Comments do **nothing** for bots. They are 100% for humans.

---

### 🧩 Block 1 — Allowing search engines

```txt
User-agent: Googlebot
Allow: /
```

| Line | What it does | Why it helps |
|------|--------------|--------------|
| `User-agent: Googlebot` | "The next rules apply only to Google's crawler." | Lets us give Google **its own special rule** (we want Google to see everything) |
| `Allow: /` | "You may crawl every URL on this site." (`/` means *the root and everything below it*) | Makes our intent **explicit**: yes, Google is welcome everywhere |

The same pattern repeats for:
```txt
User-agent: Bingbot         → Microsoft Bing search
User-agent: DuckDuckBot     → DuckDuckGo (privacy search)
User-agent: Twitterbot      → Twitter/X link previews
User-agent: facebookexternalhit → Facebook share previews
User-agent: LinkedInBot     → LinkedIn share previews
```

**Why allow social bots?**
When someone shares your link on Twitter/Facebook/LinkedIn, those platforms send a bot to fetch your page so they can show a **rich preview** (title, image, description). If you block them, your shared links look like ugly grey boxes.

> 🧠 **Real-world analogy:** Imagine your site is a restaurant. Googlebot is a *food critic* (writes a review = SEO). Twitterbot is a *photographer* (takes the cover photo for Instagram = social preview). You want **both** to come in.

---

### 🧩 Block 2 — Blocking AI training scrapers

```txt
# OpenAI — trains ChatGPT
User-agent: GPTBot
Disallow: /
```

| Line | What it does | Why we use it |
|------|--------------|---------------|
| `User-agent: GPTBot` | "The next rule applies to OpenAI's training crawler." | Targets **only** that specific bot, no one else |
| `Disallow: /` | "You may NOT crawl any URL." (`/` = the entire site) | Stops OpenAI from sucking our content into ChatGPT's brain |

Repeated for each AI bot:

| Bot blocked | Owned by | What it does |
|-------------|----------|--------------|
| `GPTBot` | OpenAI | Trains GPT models |
| `ChatGPT-User` | OpenAI | Live-fetches when ChatGPT browses |
| `OAI-SearchBot` | OpenAI | Powers ChatGPT search |
| `ClaudeBot` / `anthropic-ai` | Anthropic | Trains Claude |
| `CCBot` | Common Crawl | Open dataset reused by most AI labs |
| `Google-Extended` | Google | **AI training only** — does NOT block Google Search 👍 |
| `Applebot-Extended` | Apple | **Apple Intelligence training only** — does NOT block Apple Search 👍 |
| `PerplexityBot` | Perplexity | Powers Perplexity answers |
| `Meta-ExternalAgent` | Meta | Trains Llama / Meta AI |
| `Bytespider` | ByteDance (TikTok) | Aggressive AI scraper |

> 🛡️ **Key trick:** `Google-Extended` and `Applebot-Extended` are *separate* tokens just for AI training. Blocking them keeps you in **Google Search and Apple Search**, but opts you out of being **AI training food**. Best of both worlds.

---

### 🧩 Block 3 — The default rule for everyone else

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*.json$
```

| Line | What it does | Why it's helpful |
|------|--------------|------------------|
| `User-agent: *` | `*` is a **wildcard** = "any bot we did not name above" | Catch-all rule, so we don't have to list every bot in the world |
| `Allow: /` | "You can crawl the public pages." | Friendly default — most crawlers help you |
| `Disallow: /api/` | "Skip anything starting with `/api/`." | API endpoints return JSON, not pages. Indexing them wastes crawl budget and exposes internal URLs |
| `Disallow: /*.json$` | "Skip any URL ending in `.json`." (`*` = anything, `$` = end of URL) | Same idea — raw data files shouldn't appear in search results |

> 🧠 **Order matters in `robots.txt`:** A bot picks the **most specific `User-agent` block** that matches its name and follows ONLY that block. So `GPTBot` follows the `GPTBot:` rules and ignores the `*` rules entirely.

---

### 🧩 Block 4 — Pointing to the sitemap

```txt
Sitemap: https://id-preview--3442eccc-4121-4ae6-8dbf-4466418a15e4.lovable.app/sitemap.xml
```

| Part | Meaning |
|------|---------|
| `Sitemap:` | A special directive that tells crawlers *"here's the map of my site"* |
| Full URL | Must be **absolute** (start with `https://`), not relative |

**Why this line is gold:**
A bot might land on `robots.txt` first. If we point it to the sitemap, it instantly knows **every important URL** without having to discover them by clicking links. It's like handing a tourist a city map at the airport instead of letting them wander.

> 🎯 You can list **multiple `Sitemap:` lines** — one per file (useful if you have separate sitemaps for blog posts, products, images, etc.).

---

## 📄 6B. `public/sitemap.xml` — line by line

> 📂 Location: `public/sitemap.xml` → served at `https://yoursite.com/sitemap.xml`

### 🤔 First — what is a sitemap, in human language?

A **sitemap** is a **list of all the pages on your website** that you want search engines to know about. It's a roadmap.

**Analogy:**
> Imagine you open a new shopping mall. You print a **floor map** at the entrance: *"Floor 1 — clothes, Floor 2 — food court, Floor 3 — cinema."* Visitors find what they want faster.
>
> A **sitemap.xml** is the same map — but for Google instead of customers.

**Why it matters:**
- Google finds new pages **faster** (sometimes within hours instead of weeks).
- Pages with no internal links pointing to them (orphan pages) still get discovered.
- You can tell Google **which pages are most important** and **how often they change**.

---

### 🧩 The XML, line by line

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

| Part | Meaning |
|------|---------|
| `<?xml ... ?>` | The **XML declaration** — every XML file must start with this line |
| `version="1.0"` | Says "I'm using XML version 1.0" (the standard) |
| `encoding="UTF-8"` | Says "my characters use UTF-8" — needed so accents/emojis/non-English URLs don't break |

> 💡 If you forget this line, some strict parsers (and Google) may reject the file.

---

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```

| Part | Meaning |
|------|---------|
| `<urlset>` | The **root element** that wraps all `<url>` entries. Like `<ul>` wraps `<li>` items in HTML |
| `xmlns="..."` | The **XML namespace** — tells parsers *"I follow the official sitemap rules version 0.9"* |
| The URL inside | Just an **identifier**, not a real link — Google uses it to validate your file structure |

> 🧠 Think of `xmlns` as a **dialect tag**. It says: *"I'm speaking Sitemap-English, version 0.9, please understand me with that grammar."*

---

```xml
  <url>
```
Opens a **single page entry**. You'll have one `<url>` block per page on your site.

---

```xml
    <loc>https://id-preview--3442eccc-4121-4ae6-8dbf-4466418a15e4.lovable.app/</loc>
```

| Tag | Meaning | Rules |
|-----|---------|-------|
| `<loc>` | **Location** = the actual URL of the page | Must be **absolute** (full `https://...`), max 2048 chars, must match your real domain |

This is the **only required tag** inside `<url>`. Everything else is optional but recommended.

---

```xml
    <changefreq>weekly</changefreq>
```

**What it says:** *"This page typically changes about once a week."*

**Why it helps:** Google uses this as a **hint** to decide how often to re-crawl. Allowed values:

| Value | When to use it |
|-------|----------------|
| `always` | Pages that change on every view (live scoreboards) |
| `hourly` | News homepage |
| `daily` | Blog index, social feed |
| `weekly` | Marketing site, dashboards |
| `monthly` | About page, pricing |
| `yearly` | Terms of service, legal |
| `never` | Archived pages |

> ⚠️ **Honesty warning:** Google treats it as a *hint*, not a command. If you say `hourly` but the page never changes, Google ignores you.

---

```xml
    <priority>1.0</priority>
```

**What it says:** *"Compared to my other pages, this one's importance is 1.0 (max)."*

**Range:** `0.0` (least important) → `1.0` (most important). Default = `0.5`.

**Suggested values:**

| Page type | Priority |
|-----------|----------|
| Homepage | `1.0` |
| Main category pages | `0.8` |
| Blog posts / products | `0.6` |
| About / Contact | `0.4` |
| Legal / Terms | `0.2` |

> ⚠️ **Reality check:** Like `changefreq`, this is a **hint** Google may ignore. It's mostly useful for **other** crawlers (Bing, Yandex) and to keep your own thinking organised.

---

```xml
  </url>
</urlset>
```

| Tag | Meaning |
|-----|---------|
| `</url>` | Closes that one page entry |
| `</urlset>` | Closes the whole sitemap document |

---

### 🧩 Optional tags you can add

```xml
<lastmod>2026-05-01</lastmod>
```
**Last modified date** in `YYYY-MM-DD` format. Google **cares a lot** about this — way more than `changefreq`. If `lastmod` is recent, Google re-crawls sooner.

---

### 🧩 Adding a second page (example)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://yoursite.com/about</loc>
    <lastmod>2026-04-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://yoursite.com/blog/jira-vs-trello</loc>
    <lastmod>2026-04-29</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>
```

---

## 🤝 How `robots.txt` and `sitemap.xml` work together

A typical Googlebot visit goes like this:

```
1. Googlebot arrives at yoursite.com
2. First request → /robots.txt          (read the rules)
3. Sees "Sitemap: .../sitemap.xml"      (great, here's the map!)
4. Fetches /sitemap.xml                 (gets the list of URLs)
5. Crawls each <loc> URL                (respecting Disallow rules)
6. Sends content to Google's index      (so it shows up in search)
```

| File | One-line summary |
|------|------------------|
| `robots.txt` | The **bouncer** at the door — decides who comes in and where they can go |
| `sitemap.xml` | The **tour guide** — shows VIP guests around so they don't miss anything |

You need **both** for great SEO. Together they say: *"Here's everything I want indexed (sitemap), and here are the places to skip (robots.txt)."*

---

## 🎯 Final interview-winning closing line

> "robots.txt controls **crawling** — what bots are allowed to visit.
> Indexing controls **visibility** — what appears in search results.
> Together with a sitemap, they form the foundation of technical SEO:
> tell bots **where to go**, **what to skip**, and **what's worth remembering**."

---

*Last updated: May 1, 2026 — Jiraboard project.*

