import React, { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, LogIn, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

const chooseIndia = [
  ["About DRAA Study in India", "/about"],
  ["Why Study in India", "/why-india"],
  ["10 Reasons to Study in India", "/reasons"],
  ["Things to Do in India", "/things-to-do"],
];

const planStudies = [
  ["Courses & Institutes", "/courses"],
  ["Indian Higher Education", "/higher-education"],
  ["Institute Ranking Guide", "/institute-ranking"],
  ["Scholarships & Fee Support", "/scholarships"],
];

const resourceNav = [
  ["Notifications", "/notifications"],
  ["Educational Blogs", "/educational-blogs"],
  ["Recorded Videos", "/recorded-videos"],
];

export default function PortalHeader() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  // Click outside to close active dropdown
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMenu(null);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (menuKey: string) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const toggleMenu = (menuKey: string) => {
    setActiveMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  return (
    <header className="portal-header" ref={headerRef}>
      {/* Indian Tricolour Hairline Ribbon */}
      <div
        className="india-tricolour-hairline"
        style={{
          height: "3px",
          width: "100%",
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%)",
        }}
      />

      <div className="portal-shell portal-header-inner">
        {/* Brand with Blended Flying 3-Colour Ribbon Waves */}
        <Link className="portal-brand" to="/" aria-label="DRAA Study in India home">
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            {/* Blended Flying 3-Colour Silk Ribbon Wave */}
            <svg
              width="68"
              height="48"
              viewBox="0 0 68 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute",
                left: "-18px",
                top: "-4px",
                pointerEvents: "none",
                zIndex: 0,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06))",
              }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="blendSaffronStream" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#FF9933" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#FF7700" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FF9933" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="blendWhiteStream" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="blendGreenStream" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#138808" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#0B655D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#138808" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Saffron Silk Stream */}
              <path
                d="M2 15C12 7 24 10 38 6C50 2 60 5 66 9C56 10 46 9 36 13C26 17 14 15 2 21V15Z"
                fill="url(#blendSaffronStream)"
              />
              {/* White Silk Stream */}
              <path
                d="M2 21C13 14 25 16 39 12C51 8 61 11 66 15C56 16 46 15 36 19C26 23 14 21 2 28V21Z"
                fill="url(#blendWhiteStream)"
              />
              {/* Green Silk Stream */}
              <path
                d="M2 28C14 21 26 23 40 19C52 15 62 18 66 22C56 23 46 22 36 26C26 30 14 28 2 35V28Z"
                fill="url(#blendGreenStream)"
              />
            </svg>

            <img
              src="/media/draa-mark.png"
              alt="DRAA Logo"
              style={{ position: "relative", zIndex: 1 }}
            />
          </div>
          <span>
            <strong>DRAA STUDY IN INDIA</strong>
            <small>LEARN &middot; DISCOVER &middot; GROW</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {/* Choose India */}
          <div
            className={`nav-group ${activeMenu === "choose-india" ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter("choose-india")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="nav-group-trigger"
              onClick={() => toggleMenu("choose-india")}
              aria-expanded={activeMenu === "choose-india"}
            >
              {t("nav.chooseIndia", "Choose India")} <ChevronDown size={15} className="menu-chevron" />
            </button>
            {activeMenu === "choose-india" && (
              <div className="nav-dropdown animate-dropdown">
                {chooseIndia.map(([text, href]) => (
                  <Link key={href} to={href} onClick={() => setActiveMenu(null)}>
                    {text}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Plan your Studies */}
          <div
            className={`nav-group ${activeMenu === "plan-studies" ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter("plan-studies")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="nav-group-trigger"
              onClick={() => toggleMenu("plan-studies")}
              aria-expanded={activeMenu === "plan-studies"}
            >
              {t("nav.planStudies", "Plan your Studies")} <ChevronDown size={15} className="menu-chevron" />
            </button>
            {activeMenu === "plan-studies" && (
              <div className="nav-dropdown animate-dropdown">
                {planStudies.map(([text, href]) => (
                  <Link key={href} to={href} onClick={() => setActiveMenu(null)}>
                    {text}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Free Resources */}
          <div
            className={`nav-group ${activeMenu === "free-resources" ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter("free-resources")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="nav-group-trigger"
              onClick={() => setActiveMenu("free-resources")}
              aria-expanded={activeMenu === "free-resources"}
            >
              <BookOpen size={15} aria-hidden="true" />
              {t("nav.freeResources", "Free Resources")} <ChevronDown size={15} className="menu-chevron" />
            </button>
            {activeMenu === "free-resources" && (
              <div className="nav-dropdown animate-dropdown">
                {resourceNav.map(([text, href]) => (
                  <Link key={href} to={href} onClick={() => setActiveMenu(null)}>
                    {text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Dropdowns: Language Switcher, Register & Log in */}
        <div className="account-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LanguageSelector />

          {/* Register Dropdown */}
          <div
            className={`account-menu register-menu ${activeMenu === "register" ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter("register")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="account-menu-trigger"
              onClick={() => toggleMenu("register")}
              aria-expanded={activeMenu === "register"}
            >
              {t("nav.register", "Register")} <ChevronDown size={15} className="menu-chevron" />
            </button>
            {activeMenu === "register" && (
              <div className="account-dropdown animate-dropdown">
                <Link to="/register/student" onClick={() => setActiveMenu(null)}>
                  {t("nav.studentReg", "Student Registration")}
                </Link>
                <Link to="/register/institute" onClick={() => setActiveMenu(null)}>
                  {t("nav.instituteReg", "Institute Registration")}
                </Link>
              </div>
            )}
          </div>

          {/* Log in Dropdown */}
          <div
            className={`account-menu login-menu ${activeMenu === "login" ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter("login")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="account-menu-trigger"
              onClick={() => toggleMenu("login")}
              aria-expanded={activeMenu === "login"}
            >
              <LogIn size={15} />
              {t("nav.login", "Log in")} <ChevronDown size={14} className="menu-chevron" />
            </button>
            {activeMenu === "login" && (
              <div className="account-dropdown animate-dropdown">
                <Link to="/login/student" onClick={() => setActiveMenu(null)}>
                  {t("nav.studentLogin", "Student Login")}
                </Link>
                <Link to="/login/institute" onClick={() => setActiveMenu(null)}>
                  {t("nav.instituteLogin", "Institute Login")}
                </Link>
                <Link to="/login/admin" onClick={() => setActiveMenu(null)}>
                  {t("nav.adminLogin", "Admin Login")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }} className="mobile-actions-wrapper">
          <div className="mobile-lang-wrapper" style={{ display: "none" }}>
            <LanguageSelector />
          </div>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <NavLink to="/" onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          {[...chooseIndia, ...planStudies].map(([text, href]) => (
            <NavLink key={href} to={href} onClick={() => setMobileOpen(false)}>
              {text}
            </NavLink>
          ))}
          <strong>Free Resources</strong>
          {resourceNav.map(([text, href]) => (
            <NavLink key={href} to={href} onClick={() => setMobileOpen(false)}>
              {text}
            </NavLink>
          ))}
          <strong>Accounts</strong>
          <NavLink to="/register/student" onClick={() => setMobileOpen(false)}>
            Student Registration
          </NavLink>
          <NavLink to="/register/institute" onClick={() => setMobileOpen(false)}>
            Institute Registration
          </NavLink>
          <NavLink to="/login/student" onClick={() => setMobileOpen(false)}>
            Student Login
          </NavLink>
          <NavLink to="/login/institute" onClick={() => setMobileOpen(false)}>
            Institute Login
          </NavLink>
          <NavLink to="/login/admin" onClick={() => setMobileOpen(false)}>
            Admin Login
          </NavLink>
        </nav>
      )}

    </header>
  );
}
