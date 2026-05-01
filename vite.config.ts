import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [react()],

  // ── Path aliases ───────────────────────────────────────────────────────────
  // Lets you write:  import Button from '@/components/Button'
  // Instead of:      import Button from '../../components/Button'
  // Works everywhere in the project — no more counting "../../../"
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // ── Dev server ─────────────────────────────────────────────────────────────
  server: {
    port: 5173,   // lock the dev port so it never randomly changes
    open: true,  // auto-open the browser on every npm run dev
  },

  // ── Preview server (npm run preview) ──────────────────────────────────────
  // "preview" serves the production build locally so you can test it
  // before deploying. Locking the port keeps it predictable.
  preview: {
    port: 4173,
  },

  // ── Pre-bundling ───────────────────────────────────────────────────────────
  // Vite pre-bundles dependencies on first dev startup to speed things up.
  // Listing them explicitly here means Vite doesn't have to discover them
  // by crawling your code — shaves time off the first cold start.
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  // ── Production build ───────────────────────────────────────────────────────
  build: {

    // The folder where the final built files go.
    // Default is "dist" — keeping it explicit so it's obvious.
    outDir: 'dist',

    // Generate hidden source maps for production.
    // "hidden" means the .map files are created but the browser
    // won't load them automatically (no //# sourceMappingURL comment).
    // You can upload them to an error-tracking tool (like Sentry)
    // to get readable stack traces in production without exposing
    // your source code to users in DevTools.
    sourcemap: 'hidden',

    // Warn you in the terminal if any single chunk exceeds this size (in KB).
    // Default is 500KB. 600KB gives a little more room while still
    // catching accidental bloat before it ships.
    chunkSizeWarningLimit: 600,

    // CSS code splitting — each JS chunk gets its own CSS file.
    // So if a user visits a page that only needs one chunk,
    // only that chunk's CSS is downloaded. Default is true,
    // but declaring it explicitly makes the intent clear.
    cssCodeSplit: true,

    rollupOptions: {

      output: {

        // ── Chunk splitting strategy ─────────────────────────────────────
        // By default Vite puts everything into one big bundle.
        // This function splits it into smaller pieces so browsers can
        // cache vendor libraries separately from your app code.
        //
        // How caching works:
        //   - Your app code changes on every deploy → new hash → browser re-downloads
        //   - React/react-dom never change between deploys → same hash → browser uses cache
        //   - Without splitting, changing one line of your code forces users to
        //     re-download React (150KB) all over again. With splitting, they don't.
        manualChunks(id) {
          // React core — changes almost never, cache it aggressively
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          // React Router — changes rarely
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'vendor-router'
          }
          // Everything else in node_modules goes into a general vendor chunk
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
          // Your own code is left as-is — Vite splits it by route automatically
        },

        // ── Output file naming ───────────────────────────────────────────
        // Organise built files into named subfolders instead of a flat dump.
        // [name] = the chunk name (e.g. "vendor-react", "index")
        // [hash] = a short fingerprint that changes when the file changes
        //          — this is what forces the browser to re-download updated files
        //            and use the cache for unchanged ones (cache busting)
        chunkFileNames:  'assets/js/[name]-[hash].js',
        entryFileNames:  'assets/js/[name]-[hash].js',
        assetFileNames:  'assets/[ext]/[name]-[hash].[ext]',
        // Result: dist/assets/js/vendor-react-abc123.js
        //         dist/assets/css/index-def456.css
        //         dist/assets/img/hero-ghi789.png
      },
    },
  },
})
