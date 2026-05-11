# Compression & Image Optimization — Production Guide

---

## The Problem

Vite builds your JS/CSS into optimised chunks — but it does NOT compress them
and does NOT optimise your images. You ship raw PNG files and uncompressed JS.

```
Without optimization:
  vendor-react.js   →  186KB  (raw, uncompressed)
  hero.png          →  400KB  (raw PNG)

With optimization:
  vendor-react.js   →  186KB + vendor-react.js.br  ~52KB  (brotli, 72% smaller)
  hero.png          →  ~90KB  (compressed PNG) + hero.webp  ~60KB  (WebP)
```

---

## Part 1 — JS/CSS Compression (Brotli)

### What is it?

Brotli is a compression algorithm (made by Google) that shrinks your JS and CSS
files before they leave the server. The browser decompresses them instantly.

```
Browser sends:   Accept-Encoding: br
Server responds: Content-Encoding: br  +  the .br file
Browser gets:    the decompressed file — same code, just travelled smaller
```

### Gzip vs Brotli

| | Gzip | Brotli |
|--|------|--------|
| Compression ratio | Good | ~20% better than Gzip |
| Browser support | 100% | All modern browsers (97%+) |
| Speed | Fast | Slightly slower to compress, same to decompress |
| Used by | Legacy servers | Google, Facebook, Netflix, Amazon |

**Rule:** Always prefer Brotli. Fall back to Gzip for old servers.

### How big companies do it

Netflix, Google, and Facebook all pre-compress assets at build time and store
both `.js` and `.js.br` on their CDN. When a request comes in:

```
CDN checks Accept-Encoding header
  → br supported?  serve .js.br
  → gz supported?  serve .js.gz
  → neither?       serve .js
```

This is called **static compression** — compress once at build, serve forever.
The alternative is **dynamic compression** — compress on every request. Static
is always faster because the CPU work is done once, not per user.

### Setup — vite-plugin-compression

```bash
npm install -D vite-plugin-compression
```

```ts
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

plugins: [
  react(),
  viteCompression({ algorithm: 'brotliCompress' }),  // creates .br files
  viteCompression({ algorithm: 'gzip' }),             // creates .gz fallback
],
```

**What it produces in dist/:**
```
assets/js/vendor-react-abc123.js       ← original (186KB)
assets/js/vendor-react-abc123.js.br    ← brotli   (~52KB)
assets/js/vendor-react-abc123.js.gz    ← gzip     (~62KB)
```

### Does your server need config?

| Platform | What you need |
|----------|--------------|
| Netlify | Nothing — CDN serves .br automatically |
| Vercel | Nothing — CDN serves .br automatically |
| Nginx | `gzip_static on; brotli_static on;` |
| Apache | `mod_brotli` + `mod_deflate` enabled |
| Express (Node) | `serve-static` won't use .br — need `express-static-gzip` |

**Since you're on Netlify right now — the plugin is redundant.**
Netlify compresses at the CDN level automatically. Add it only when you move
to a self-hosted server (Nginx, EC2, VPS).

---

## Part 2 — Image Optimization

### What is it?

Two things:
1. **Compression** — shrink PNG/JPG file size without visible quality loss
2. **WebP conversion** — convert to a modern format that's 25-35% smaller than PNG

### PNG vs WebP

| | PNG | WebP |
|--|-----|------|
| Compression | Lossless only | Lossless + lossy |
| Typical size | 400KB | ~250KB (same quality) |
| Browser support | 100% | 97%+ (all modern browsers) |
| Transparency | Yes | Yes |

### Your images right now

```
public/icon-192.png          — PWA icon, served on every install
public/icon-512.png          — PWA icon, served on every install
public/screenshot-desktop.png — shown in PWA install dialog
public/screenshot-mobile.png  — shown in PWA install dialog
src/assets/hero.png           — loaded in the app
```

None of these are compressed. They ship at full raw size.

### Setup — vite-plugin-imagemin

```bash
npm install -D @vheemstra/vite-plugin-imagemin imagemin-webp imagemin-pngquant
```

```ts
// vite.config.ts
import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminWebp from 'imagemin-webp'
import imageminPngquant from 'imagemin-pngquant'

plugins: [
  react(),
  viteImagemin({
    plugins: {
      png: imageminPngquant({ quality: [0.6, 0.8] }),  // compress PNGs
    },
    makeWebp: {
      plugins: {
        png: imageminWebp({ quality: 75 }),  // also create .webp versions
      },
    },
  }),
],
```

**What it produces:**
```
src/assets/hero.png      ← compressed PNG  (~90KB, was 400KB)
src/assets/hero.webp     ← WebP version    (~60KB)
```

### How to use WebP with PNG fallback in React

```tsx
// Browser picks WebP if supported, falls back to PNG if not
<picture>
  <source srcSet="/hero.webp" type="image/webp" />
  <img src="/hero.png" alt="Hero" width={1280} height={640} />
</picture>
```

### What about PWA icons?

PWA icons (`icon-192.png`, `icon-512.png`) must stay as PNG — the Web App
Manifest spec requires PNG. The imagemin plugin will still compress them,
just won't convert them to WebP.

---

## Part 3 — What Netlify Already Does For You

Since you're on Netlify, this is already handled without any config:

| Optimization | Netlify handles it? |
|-------------|-------------------|
| Brotli/Gzip compression of JS/CSS | ✅ Yes — automatic at CDN |
| HTTP/2 (parallel file loading) | ✅ Yes — automatic |
| Cache-Control headers | ✅ Yes — immutable for hashed files |
| Image compression | ❌ No — you must do this at build time |
| WebP conversion | ❌ No — you must do this at build time |

**Bottom line:**
- On Netlify: skip `vite-plugin-compression`, add `vite-plugin-imagemin`
- On self-hosted (Nginx/EC2): add both plugins

---

## Full vite.config.ts with both plugins

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminWebp from 'imagemin-webp'
import imageminPngquant from 'imagemin-pngquant'

export default defineConfig({
  plugins: [
    react(),

    // Only needed for self-hosted servers (Nginx, EC2, VPS)
    // Skip on Netlify/Vercel — their CDN handles this automatically
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' }),

    // Always useful — Netlify does NOT compress images for you
    viteImagemin({
      plugins: { png: imageminPngquant({ quality: [0.6, 0.8] }) },
      makeWebp: { plugins: { png: imageminWebp({ quality: 75 }) } },
    }),
  ],

  // ... rest of your existing config unchanged
})
```

---

## Summary

| What | Tool | Netlify | Self-hosted |
|------|------|---------|-------------|
| JS/CSS Brotli compression | `vite-plugin-compression` | Not needed | Required |
| JS/CSS Gzip fallback | `vite-plugin-compression` | Not needed | Required |
| PNG compression | `vite-plugin-imagemin` | Required | Required |
| WebP conversion | `vite-plugin-imagemin` | Required | Required |

> One rule: images are always your responsibility. Compression of JS/CSS
> depends on where you host.

---

*Last updated: 2026 — Compression & Image Optimization*
