import React from"react";
import { Link } from"react-router-dom";
import { ArrowRight, UserCheck, GraduationCap, ShieldAlert } from"lucide-react";
import"./UnifiedRegister.css";

export default function UnifiedRegisterPortal() {
  return (
    <main className="unified-register-page">
      <div className="container">
        
        {/* BREADCRUMB */}
        <nav className="figma-breadcrumb">
          <Link to="/">Home</Link> <ArrowRight size={14} style={{ opacity: 0.5 }} /> <span className="active">Login & Sign Up</span>
        </nav>

        {/* HEADER */}
        <header className="portal-header">
          <h1>
            Welcome to <span>Draa</span>
          </h1>
          <p>
            Choose your learning or instructing portal to get started. Access exams, manage live sessions, download books, and keep track of your progress.
          </p>
        </header>

        {/* PORTAL GATEWAY CARDS */}
        <div className="portal-grid">
          
          {/* STUDENT PORTAL CARD */}
          <div className="portal-card student-card">
            <div className="card-visual-box">
              {/* Custom High-Quality Student SVG Illustration */}
              <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background glowing circle */}
                <circle cx="120" cy="100" r="70" fill="url(#studentGlow)" opacity="0.15" />
                
                {/* Floating particles */}
                <circle cx="50" cy="60" r="5" fill="#3b82f6" className="svg-animate-float-y" />
                <circle cx="190" cy="70" r="4" fill="#60a5fa" className="svg-animate-float-y-slow" />
                <circle cx="70" cy="140" r="6" fill="#66735b" className="svg-animate-float-y-slow" />
                
                {/* Stack of books under cap */}
                <g className="svg-animate-float-y">
                  {/* Book 1 (Bottom) */}
                  <rect x="65" y="115" width="110" height="15" rx="3" fill="#3b82f6" />
                  <path d="M165 115H175V130H165V115Z" fill="#2563eb" />
                  {/* Book 2 (Middle) */}
                  <rect x="75" y="102" width="90" height="13" rx="3" fill="#60a5fa" />
                  <path d="M155 102H165V115H155V102Z" fill="#3b82f6" />
                </g>

                {/* Central Graduation Cap */}
                <g className="svg-animate-float-y-slow" style={{ transformOrigin:"120px 80px" }}>
                  {/* Cap diamond */}
                  <path d="M120 45L185 70L120 95L55 70L120 45Z" fill="#bd7b20" />
                  <path d="M120 50L175 70L120 90L65 70L120 50Z" fill="#9b6118" />
                  {/* Cap stand/base */}
                  <path d="M85 77V92C85 96.4 100.7 100 120 100C139.3 100 155 96.4 155 92V77" fill="#1e3a8a" />
                  {/* Cap tassel cord and blob */}
                  <path d="M120 70L152 82V96" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="152" cy="98" r="5" fill="#f59e0b" />
                </g>

                {/* Glowing Orbital Ring with Sparks */}
                <g className="svg-animate-spin" style={{ transformOrigin:"120px 100px" }}>
                  <circle cx="120" cy="100" r="82" stroke="#bd7b20" strokeWidth="1.5" strokeDasharray="12 24" className="svg-animate-pulse" />
                  <circle cx="120" cy="18" r="4" fill="#fbbf24" />
                  <circle cx="38" cy="100" r="3" fill="#60a5fa" />
                </g>

                {/* Definitions of gradients */}
                <defs>
                  <radialGradient id="studentGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 100) rotate(90) scale(70)">
                    <stop offset="0%" stopColor="#bd7b20" />
                    <stop offset="100%" stopColor="#66735b" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            
            <h3>Student Gateway</h3>
            <p className="card-desc">
              Access your learning materials, practice mock test series, read purchased books, track assignments, and view performance analytics.
            </p>

            <div className="auth-button-group">
              <Link to="/student-login" className="portal-btn btn-primary">
                Sign In as Student <ArrowRight size={16} />
              </Link>
              <Link to="/student-register" className="portal-btn btn-secondary">
                Create Student Account
              </Link>
            </div>
          </div>

          {/* TEACHER PORTAL CARD */}
          <div className="portal-card teacher-card">
            <div className="card-visual-box">
              {/* Custom High-Quality Teacher SVG Illustration */}
              <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background glowing circle */}
                <circle cx="120" cy="100" r="70" fill="url(#teacherGlow)" opacity="0.15" />
                
                {/* Classroom Board / Stand */}
                <rect x="60" y="55" width="120" height="75" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
                
                {/* Interactive whiteboard content */}
                <line x1="75" y1="70" x2="110" y2="70" stroke="#66735b" strokeWidth="3" strokeLinecap="round" />
                <line x1="75" y1="82" x2="135" y2="82" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="75" y1="94" x2="120" y2="94" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Dynamic mini-stats graph on whiteboard */}
                <path d="M125 110L140 90L155 100L168 75" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="168" cy="75" r="3.5" fill="#f43f5e" className="svg-animate-pulse" />

                {/* Floating Creative Idea Bulb */}
                <g className="svg-animate-float-y" style={{ transformOrigin:"120px 100px" }}>
                  {/* Glowing halo behind bulb */}
                  <circle cx="120" cy="35" r="16" fill="#fef08a" opacity="0.4" className="svg-animate-pulse" />
                  {/* Bulb glass */}
                  <path d="M120 18C111.7 18 105 24.7 105 33C105 38.2 107.6 42.8 111.7 45.5L111.7 51C111.7 52.1 112.6 53 113.7 53H126.3C127.4 53 128.3 52.1 128.3 51L128.3 45.5C132.4 42.8 135 38.2 135 33C135 24.7 128.3 18 120 18Z" fill="#fbbf24" />
                  {/* Bulb filament */}
                  <path d="M117 32V38M123 32V38M115 28C115 25.2 117.2 23 120 23C122.8 23 125 25.2 125 28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Bulb metal socket base */}
                  <rect x="115.5" y="53" width="9" height="4" rx="1" fill="#94a3b8" />
                  <rect x="117.5" y="57" width="5" height="3" rx="0.5" fill="#64748b" />
                </g>

                {/* Management Gear Element */}
                <g className="svg-animate-spin-reverse" style={{ transformOrigin:"45px 145px" }}>
                  <circle cx="45" cy="145" r="12" fill="#d4a554" />
                  <rect x="42.5" y="128" width="5" height="6" rx="1" fill="#66735b" />
                  <rect x="42.5" y="156" width="5" height="6" rx="1" fill="#66735b" />
                  <rect x="28" y="142.5" width="6" height="5" rx="1" fill="#66735b" />
                  <rect x="56" y="142.5" width="6" height="5" rx="1" fill="#66735b" />
                </g>

                {/* Glowing Teacher Orbital Ring */}
                <g className="svg-animate-spin" style={{ transformOrigin:"120px 100px" }}>
                  <circle cx="120" cy="100" r="84" stroke="#66735b" strokeWidth="1.5" strokeDasharray="8 20" className="svg-animate-pulse" />
                  <circle cx="204" cy="100" r="3" fill="#f43f5e" />
                  <circle cx="120" cy="184" r="4" fill="#d4a554" />
                </g>

                {/* Definitions of gradients */}
                <defs>
                  <radialGradient id="teacherGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 100) rotate(90) scale(70)">
                    <stop offset="0%" stopColor="#66735b" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            
            <h3>Teacher Gateway</h3>
            <p className="card-desc">
              Manage courses, launch real-time video lectures, publish study guides, evaluate submissions, and construct online test series exams.
            </p>

            <div className="auth-button-group">
              <Link to="/teacher-login" className="portal-btn btn-primary">
                Sign In as Teacher <ArrowRight size={16} />
              </Link>
              <Link to="/teacher-register" className="portal-btn btn-secondary">
                Apply as Teacher
              </Link>
            </div>
          </div>

        </div>

        {/* BOTTOM TRIGGER AREA FOR ADMINS */}
        <div className="admin-trigger-bar">
          <Link to="/admin-login" className="admin-link">
            <ShieldAlert size={16} />
            Are you an Administrator? Access Admin Console
          </Link>
        </div>

      </div>
    </main>
  );
}
