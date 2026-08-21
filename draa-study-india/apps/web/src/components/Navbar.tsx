import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({
  onOpenLogin,
  onOpenRegister,
}: {
  onOpenLogin: (role?: string) => void;
  onOpenRegister: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="header" className="header">
      <div className="cs-header cs-container">
        {/* Exact Study in India Logo area with DRAA Brand */}
        <Link to="/" className="cs-logo">
          <img
            src="/brand/draa-mark.png"
            alt="DRAA Study in India"
            className="cs-logo-img"
          />
          <div className="cs-logo-text">
            <strong>Study in India</strong>
            <small>DRAA Education Gateway</small>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav id="navmenu" className="navmenu d-none d-lg-block">
          <ul className="d-flex align-items-center">
            {/* Choose India */}
            <li className="dropdown">
              <a href="#" onClick={(e) => e.preventDefault()}>
                Choose India <i className="bi bi-chevron-down ms-1" style={{ fontSize: "11px" }}></i>
              </a>
              <ul className="submenu">
                <li><Link to="/WhyIndia">Why India</Link></li>
                <li><Link to="/10-reasons-to-study-in-india">10 Reasons to Study In India</Link></li>
                <li><Link to="/things-to-do-in-india">Things To Do In India</Link></li>
              </ul>
            </li>

            {/* Plan your Studies */}
            <li className="dropdown">
              <a href="#" onClick={(e) => e.preventDefault()}>
                Plan your Studies <i className="bi bi-chevron-down ms-1" style={{ fontSize: "11px" }}></i>
              </a>
              <ul className="submenu">
                <li><Link to="/courses/exploreallcoruses">Courses and Institutes</Link></li>
                <li><Link to="/indian-higher-education">Indian Higher Education</Link></li>
                <li><Link to="/institute-ranking">Institute Ranking</Link></li>
                <li><Link to="/scholarships">Scholarships &amp; Fellowships</Link></li>
              </ul>
            </li>

            {/* Register */}
            <li className="dropdown ms-2">
              <a className="hd-btn-trans" href="#" onClick={(e) => e.preventDefault()}>
                <span>Register</span> <i className="bi bi-chevron-down ms-1" style={{ fontSize: "11px" }}></i>
              </a>
              <ul className="submenu rgt">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenRegister(); }}>
                    Student Registration
                  </a>
                </li>
                <li>
                  <Link to="/register?type=institute">Institute Registration</Link>
                </li>
              </ul>
            </li>

            {/* Log in */}
            <li className="dropdown ms-2">
              <a
                className="hd-btn-primary"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLogin("Student");
                }}
              >
                <span>Log in</span> <i className="bi bi-chevron-down ms-1" style={{ fontSize: "11px" }}></i>
              </a>
              <ul className="submenu rgt">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("Student"); }}>
                    Student Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("Institute"); }}>
                    Institute Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("VisaMission"); }}>
                    Visa/Mission Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("FRRO"); }}>
                    FRRO Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("ICCR"); }}>
                    ICCR Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("Admin"); }}>
                    Admin Login
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onOpenLogin("Ministry"); }}>
                    Ministry Login
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="d-lg-none">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi ${mobileMenuOpen ? "bi-x-lg" : "bi-list"} fs-5`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="d-lg-none bg-white border-top p-3 shadow">
          <div className="mb-2">
            <strong className="d-block text-muted small mb-1">Choose India</strong>
            <Link to="/WhyIndia" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Why India</Link>
            <Link to="/10-reasons-to-study-in-india" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">10 Reasons to Study In India</Link>
            <Link to="/things-to-do-in-india" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Things To Do In India</Link>
          </div>

          <div className="mb-3 pt-2 border-top">
            <strong className="d-block text-muted small mb-1">Plan your Studies</strong>
            <Link to="/courses/exploreallcoruses" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Courses and Institutes</Link>
            <Link to="/indian-higher-education" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Indian Higher Education</Link>
            <Link to="/institute-ranking" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Institute Ranking</Link>
            <Link to="/scholarships" onClick={() => setMobileMenuOpen(false)} className="d-block py-1 text-dark small fw-semibold">Scholarships &amp; Fellowships</Link>
          </div>

          <div className="d-flex gap-2 pt-2 border-top">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="btn btn-outline-warning btn-sm w-50 fw-bold"
            >
              Register
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenLogin("Student"); }}
              className="btn btn-warning text-white btn-sm w-50 fw-bold"
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
