import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import PortalLayout from "./components/PortalLayout";
import ContentPage from "./pages/ContentPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResourcesPage from "./pages/ResourcesPage";
import ContactPage from "./pages/ContactPage";
import ReasonsPage from "./pages/ReasonsPage";
import ThingsToDoPage from "./pages/ThingsToDoPage";

const contentPaths = [
  "about",
  "why-india",
  "higher-education",
  "institute-ranking",
  "eligibility",
  "scholarships",
  "how-to-apply",
  "visa-frro",
  "local-support",
  "faq",
  "privacy",
];

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        <Route element={<PortalLayout />}>
          <Route index element={<HomePage />} />
          <Route path="reasons" element={<ReasonsPage />} />
          <Route path="things-to-do" element={<ThingsToDoPage />} />
          <Route path="things-to-do-in-india" element={<Navigate to="/things-to-do" replace />} />
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
    </BrowserRouter>
  </LanguageProvider>
  );
}
