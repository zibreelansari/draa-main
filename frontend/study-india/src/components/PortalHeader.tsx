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
        {/* Brand with Flying 3-Colour Ribbon Accent */}
        <Link className="portal-brand" to="/" aria-label="DRAA Study in India home">
          <img src="/media/draa-mark.png" alt="DRAA Logo" />
          <span>
            <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              DRAA STUDY IN INDIA
              {/* Flying 3-Colour Waving Ribbon (No Chakra) */}
              <svg
                width="30"
                height="20"
                viewBox="0 0 30 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="flySaffron" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="100%" stopColor="#E66A00" />
                  </linearGradient>
                  <linearGradient id="flyWhite" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="flyGreen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#138808" />
                    <stop offset="100%" stopColor="#0B655D" />
                  </linearGradient>
                </defs>
                {/* Saffron Wave Ribbon */}
                <path
                  d="M1 5.5C6 3 12 7.5 18 4.5C23 2 27.5 3 29 4C27 6 22.5 5.5 17.5 8C12 10.5 6 6.5 1 9V5.5Z"
                  fill="url(#flySaffron)"
                />
                {/* White Wave Ribbon */}
                <path
                  d="M1 9C6 6.5 12 10.5 17.5 8C22.5 5.5 27 6 29 4C27.5 6.5 23 8.5 18 11C12.5 13.5 6.5 9.5 1 12.5V9Z"
                  fill="url(#flyWhite)"
                />
                {/* Green Wave Ribbon */}
                <path
                  d="M1 12.5C6.5 9.5 12.5 13.5 18 11C23 8.5 27.5 6.5 29 4C27 7.5 22 11.5 17 14C11.5 16.5 5.5 13 1 16V12.5Z"
                  fill="url(#flyGreen)"
                />
              </svg>
            </strong>
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
