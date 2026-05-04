import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/styles/dashboard.css";
import Board from "@/pages/Board";
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback="loading...">
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

// ───────────────────────────────────────────────────────────────────────────
// <BrowserRouter>
//
// WHAT: The top-level router. It must wrap any component that wants to read
//       or change the URL (Routes, Link, useNavigate, useParams, etc.).
//
// WHY:  We're a Single Page Application — the browser only ever loads one
//       HTML file. BrowserRouter lets us *fake* multiple pages by reacting
//       to URL changes on the client without a full page reload. That's
//       what makes navigation feel instant.
//
// HOW:  It uses the HTML5 History API (pushState / popState) under the hood.
//       It listens to the address bar; whenever the path changes it tells
//       the <Routes> below to re-render with whatever component matches.
//       URLs stay clean (e.g. "/about") — no "#" hash like HashRouter.
// ───────────────────────────────────────────────────────────────────────────

/*
      <Routes>

      WHAT: A container that holds every <Route /> in the app.
      WHY:  It picks the SINGLE best-matching route for the current URL and
            renders only that one. Without it, every Route would render
            independently and you'd see multiple pages stacked together.
      HOW:  On every URL change it walks its <Route> children, scores each
            against the current path, and mounts the winner's `element`.
    */


  
  /* <Route /> */


//     <Route path="/" element={<Index />} />
// WHAT: A single URL → component rule.
// WHY:  Tells the router "when the user is at '/', show the Index page."
//       This is the home page of the app.
// HOW:  `path` is the URL pattern to match, `element` is the JSX to
//       render when it matches. Add more <Route /> lines above the
//       catch-all below to register additional pages
//       (e.g. <Route path="/about" element={<About />} />).
