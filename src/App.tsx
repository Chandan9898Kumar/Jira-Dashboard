import { useState } from "react";

import "./App.css";
import SEOHead from "./components/SEOHead";

function App() {
  const BASE =
    "https://id-preview--3442eccc-4121-4ae6-8dbf-4466418a15e4.lovable.app";

  return (
    <>
      {/* SEOHead writes canonical + meta tags into <head> for this page.
          Change the props here whenever the page content changes. */}
      <SEOHead
        title="Jiraboard – Kanban Project Dashboard with Drag & Drop"
        description="Jiraboard is a fast, accessible Kanban dashboard for managing tasks, bugs and stories with drag-and-drop, search and filters."
        canonical={`${BASE}/`}
      />
    </>
  );
}
export default App;
