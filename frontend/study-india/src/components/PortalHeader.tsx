import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Building2, ChevronDown, ChevronRight, Compass, GraduationCap, LogIn, Menu, X } from "lucide-react";
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
      <div className="portal-shell portal-header-inner">
        {/* Brand */}
        <Link className="portal-brand" to="/" aria-label="DRAA Study in India home">
          <img src="/media/draa-mark.png" alt="DRAA Logo" />
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
        <div className="account-actions">
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
        <div className="mobile-actions-wrapper">
          <div className="mobile-lang-wrapper">
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

      {/* Mobile Backdrop & Drawer Nav */}
      {mobileOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {/* Primary Action Buttons */}
            <div className="mobile-nav-actions">
              <Link
                to="/register/student"
                className="mobile-btn-apply"
                onClick={() => setMobileOpen(false)}
              >
                <GraduationCap size={16} />
                <span>Student Apply</span>
              </Link>
              <Link
                to="/login/student"
                className="mobile-btn-login"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn size={15} />
                <span>Student Login</span>
              </Link>
            </div>

            {/* Choose India */}
            <div className="mobile-nav-group">
              <span className="mobile-group-title">
                <Compass size={13} /> {t("nav.chooseIndia", "Choose India")}
              </span>
              <NavLink
                to="/"
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                <span>Gateway Home</span>
                <ChevronRight size={14} color="#94a3b8" />
              </NavLink>
              {chooseIndia.map(([text, href]) => (
                <NavLink
                  key={href}
                  to={href}
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{text}</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </NavLink>
              ))}
            </div>

            {/* Plan Your Studies */}
            <div className="mobile-nav-group">
              <span className="mobile-group-title">
                <GraduationCap size={13} /> {t("nav.planStudies", "Plan your Studies")}
              </span>
              {planStudies.map(([text, href]) => (
                <NavLink
                  key={href}
                  to={href}
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{text}</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </NavLink>
              ))}
            </div>

            {/* Free Resources */}
            <div className="mobile-nav-group">
              <span className="mobile-group-title">
                <BookOpen size={13} /> {t("nav.freeResources", "Free Resources")}
              </span>
              {resourceNav.map(([text, href]) => (
                <NavLink
                  key={href}
                  to={href}
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{text}</span>
                  <ChevronRight size={14} color="#94a3b8" />
                </NavLink>
              ))}
            </div>

            {/* Institutional & Admin Access */}
            <div className="mobile-nav-group">
              <span className="mobile-group-title">
                <Building2 size={13} /> Institutional & Governance Access
              </span>
              <div className="mobile-sub-pill-row">
                <Link
                  to="/register/institute"
                  className="mobile-sub-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Institute Reg
                </Link>
                <Link
                  to="/login/institute"
                  className="mobile-sub-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Institute Desk
                </Link>
                <Link
                  to="/login/admin"
                  className="mobile-sub-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin Operations
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
