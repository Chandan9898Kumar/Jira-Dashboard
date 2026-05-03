// ─────────────────────────────────────────────────────────────────────────────
// NotFound.tsx — the 404 page shown by the catch-all route in App.tsx.
//
// Industry-standard practices applied here:
//   1. Semantic HTML        → <main> + proper heading hierarchy (one <h1>).
//   2. SEO / crawler hints  → set <title> and a `noindex` meta tag so search
//                             engines don't index broken URLs.
//   3. Client-side nav      → use React Router's <Link> instead of a raw <a>
//                             so we don't trigger a full page reload.
//   4. Accessibility        → role="alert" + aria-labelledby so assistive tech
//                             announces the error clearly.
//   5. Observability        → log the bad path once (useful in production
//                             monitoring tools like Sentry / LogRocket).
//   6. Graceful UX          → offer BOTH "Go home" and "Go back" actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "@/styles/dashboard.css";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the missing route — in a real app this is where you'd ping
    // your error-tracking service (Sentry, Datadog, etc.) so you can
    // spot dead links and broken redirects in production.
    console.warn("404 — route not found:", location.pathname);

    // Set a descriptive <title> so the browser tab and search results
    // accurately reflect the page state.
    const previousTitle = document.title;
    document.title = "404 — Page not found";

    // Tell crawlers NOT to index this URL. Without this, a broken link
    // could end up in Google's index as a real page.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, follow";
    document.head.appendChild(meta);

    // Cleanup on unmount so we don't leak meta tags or leave the wrong
    // title behind when the user navigates away.
    return () => {
      document.title = previousTitle;
      document.head.removeChild(meta);
    };
  }, [location.pathname]);

  return (
    <main className="not-found" role="main">
      <section
        className="not-found-inner"
        role="alert"
        aria-labelledby="not-found-title"
      >
        {/* aria-hidden because "404" is decorative — the real message
            is in the <h1> below, which screen readers will announce. */}
        <p className="not-found-code" aria-hidden="true">
          404
        </p>

        <h1 id="not-found-title">Page not found</h1>

        <p className="not-found-message">
          We couldn't find <code>{location.pathname}</code>. The link may be
          broken, or the page may have been moved.
        </p>

        <div className="not-found-actions">
          {/* <Link> performs client-side navigation — no full reload. */}
          <Link to="/" className="btn btn-primary">
            Return home
          </Link>

          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
