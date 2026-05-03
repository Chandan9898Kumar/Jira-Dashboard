import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/styles/dashboard.css";
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback="loading...">
        <Routes>
          <Route path="/" element="" />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
