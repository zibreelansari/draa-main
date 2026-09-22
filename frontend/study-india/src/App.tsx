import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import PortalLayout from "./components/PortalLayout";

// ── Lazy-loaded pages for code-splitting ─────────────────────────────────────
// Heavy pages (CoursesPage, CourseDetailPage) pull in the 2.5MB catalog data.
// By lazy-loading them, that data only downloads when the user navigates there.
const HomePage = React.lazy(() => import("./pages/HomePage"));
const CoursesPage = React.lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = React.lazy(() => import("./pages/CourseDetailPage"));
const ContentPage = React.lazy(() => import("./pages/ContentPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const ResourcesPage = React.lazy(() => import("./pages/ResourcesPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const ReasonsPage = React.lazy(() => import("./pages/ReasonsPage"));
const ThingsToDoPage = React.lazy(() => import("./pages/ThingsToDoPage"));
const HigherEducationPage = React.lazy(() => import("./pages/HigherEducationPage"));
const ScholarshipsPage = React.lazy(() => import("./pages/ScholarshipsPage"));

const contentPaths = [
  "about",
  "why-india",
  "institute-ranking",
  "eligibility",
  "how-to-apply",
  "visa-frro",
  "local-support",
  "faq",
  "privacy",
];

/** Minimal page-level loading spinner shown while lazy chunks download */
function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "12px", color: "#64748b",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span style={{ fontSize: "0.95rem" }}>Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route element={<PortalLayout />}>
            <Route index element={<HomePage />} />
            <Route path="reasons" element={<ReasonsPage />} />
            <Route path="things-to-do" element={<ThingsToDoPage />} />
            <Route path="things-to-do-in-india" element={<Navigate to="/things-to-do" replace />} />
            <Route path="higher-education" element={<HigherEducationPage />} />
            <Route path="indian-higher-education" element={<Navigate to="/higher-education" replace />} />
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:slug" element={<CourseDetailPage />} />
            <Route path="notifications" element={<ResourcesPage />} />
            <Route path="educational-blogs" element={<ResourcesPage />} />
            <Route path="recorded-videos" element={<ResourcesPage />} />
            <Route path="contact" element={<ContactPage />} />

            {contentPaths.map((path) => (
              <Route key={path} path={path} element={<ContentPage />} />
            ))}

            <Route path="login" element={<LoginPage />} />
            <Route path="login/:role" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="register/:role" element={<RegisterPage />} />
          </Route>

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}
