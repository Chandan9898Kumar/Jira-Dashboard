// SEOHead.tsx
// This component lets every "page" in your app set its own SEO tags.
// It runs in the browser and directly writes into <head> — no extra library needed.

import { useEffect } from 'react'

// ---------- types ----------
// These are the props you pass when you use <SEOHead ... /> on a page.
interface SEOHeadProps {
  title: string          // The tab title AND the headline Google shows in search results
  description: string    // The 1-2 sentence summary Google shows under the title in results
  canonical: string      // The "official" URL for this page — tells Google which URL to index
  ogImage?: string       // The image shown when someone shares this page on social media
  noIndex?: boolean      // Pass true on pages you DON'T want Google to index (e.g. /admin)
}

// ---------- helper ----------
// Finds an existing <meta> tag by attribute, or creates a brand-new one.
// This prevents duplicate tags if the component re-renders.
function upsertMeta(attr: string, value: string, content: string) {
  // Look for an existing tag that already has this attribute+value pair
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`)

  if (!el) {
    // No existing tag found → create one and add it to <head>
    el = document.createElement('meta')
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }

  // Whether we found it or just created it, set/update the content
  el.setAttribute('content', content)
}

// ---------- component ----------
export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png', // default share image
  noIndex = false,
}: SEOHeadProps) {

  useEffect(() => {
    // ── 1. Page title ──────────────────────────────────────────────────────────
    // This is the blue clickable headline in Google search results.
    document.title = title

    // ── 2. Meta description ────────────────────────────────────────────────────
    // The grey summary text under the title in Google results.
    // Keep it under 160 characters or Google will cut it off.
    upsertMeta('name', 'description', description)

    // ── 3. Canonical URL ───────────────────────────────────────────────────────
    // Tells Google: "Even if this page is reachable at multiple URLs
    // (e.g. with/without trailing slash, with ?utm= params), THIS is the
    // one true URL you should index." Prevents duplicate-content penalties.
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', canonical)

    // ── 4. Robots directive ────────────────────────────────────────────────────
    // "index, follow" = "please index this page AND follow its links"
    // "noindex, nofollow" = "skip this page entirely" (used for /admin, /login, etc.)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1')

    // ── 5. Open Graph tags (Facebook, LinkedIn, WhatsApp previews) ─────────────
    // When someone pastes your URL into Facebook/LinkedIn, these tags control
    // what the preview card looks like.
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)       // canonical URL again — for OG
    upsertMeta('property', 'og:image', ogImage)       // the thumbnail image in the card
    upsertMeta('property', 'og:type', 'website')      // "website" vs "article" vs "product"
    upsertMeta('property', 'og:site_name', 'Jiraboard') // your brand name on the OG card

    // ── 6. Twitter Card tags ───────────────────────────────────────────────────
    // Same idea as OG, but specifically for Twitter/X previews.
    // "summary_large_image" = show a big image card (not a tiny thumbnail).
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

  }, [title, description, canonical, ogImage, noIndex])
  // The array above means: re-run this effect whenever any of these props change.
  // So if you navigate to a different page, the tags update automatically.

  // This component renders nothing visible — it only touches <head>.
  return null
}
