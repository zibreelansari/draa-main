import React from'react';
import { Link } from'react-router-dom';
import { CheckCircle2, ArrowRight } from'lucide-react';
import'./AssetsInCourses.css';

/*  Large Right-Side Illustration  */
const AssetsIllustration = () => (
  <svg
    viewBox="0 0 520 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="assets-hero-svg"
    aria-hidden="true"
  >
    {/* Background */}
    <circle cx="260" cy="210" r="170" fill="#f3f4ff" fillOpacity="0.6"/>
    <circle cx="60" cy="350" r="40" fill="#fde2e8" fillOpacity="0.4"/>
    <circle cx="460" cy="70" r="35" fill="#dcfce7" fillOpacity="0.4"/>
    <circle cx="440" cy="380" r="25" fill="#fef9c3" fillOpacity="0.5"/>

    {/* Stars */}
    <path d="M480 130 L481.5 134 L486 134.3 L482.5 137.5 L483.5 142 L480 139.5 L476.5 142 L477.5 137.5 L474 134.3 L478.5 134 Z" fill="#fbbf24"/>
    <path d="M50 140 L51 143 L54 143.2 L51.5 145.5 L52.2 148.5 L50 146.5 L47.8 148.5 L48.5 145.5 L46 143.2 L49 143 Z" fill="#bd7b20" fillOpacity="0.5"/>

    {/* Central open laptop with video */}
    <rect x="130" y="160" width="240" height="150" rx="14" fill="#1e293b"/>
    <rect x="140" y="168" width="220" height="128" rx="8" fill="#0f172a"/>
    <rect x="140" y="168" width="220" height="60" rx="8" fill="#bd7b20" fillOpacity="0.15"/>
    <rect x="140" y="215" width="220" height="6" fill="#0f172a"/>
    {/* Play button */}
    <circle cx="250" cy="195" r="28" fill="#bd7b20" fillOpacity="0.2"/>
    <circle cx="250" cy="195" r="18" fill="#bd7b20"/>
    <polygon points="246,188 246,202 258,195" fill="white"/>
    {/* Video timeline */}
    <rect x="148" y="228" width="205" height="5" rx="2.5" fill="#334155"/>
    <rect x="148" y="228" width="130" height="5" rx="2.5" fill="#bd7b20"/>
    {/* Notes on screen */}
    <rect x="148" y="240" width="100" height="4" rx="2" fill="#475569"/>
    <rect x="148" y="248" width="80" height="4" rx="2" fill="#475569"/>
    <rect x="148" y="256" width="90" height="4" rx="2" fill="#475569"/>
    <rect x="148" y="264" width="70" height="4" rx="2" fill="#475569"/>
    <rect x="148" y="272" width="85" height="4" rx="2" fill="#475569"/>
    <rect x="148" y="280" width="60" height="4" rx="2" fill="#475569"/>
    {/* Laptop base */}
    <rect x="115" y="310" width="270" height="14" rx="7" fill="#334155"/>
    <rect x="160" y="316" width="180" height="6" rx="3" fill="#475569"/>

    {/* Video card top-left */}
    <rect x="50" y="60" width="130" height="85" rx="16" fill="white" filter="url(#assets-shadow)"/>
    <rect x="65" y="76" width="50" height="50" rx="12" fill="#f7f1e5"/>
    <circle cx="90" cy="101" r="16" fill="#bd7b20" fillOpacity="0.15"/>
    <circle cx="90" cy="101" r="10" fill="#bd7b20"/>
    <polygon points="88,97 88,105 96,101" fill="white"/>
    <rect x="125" y="82" width="48" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="125" y="92" width="36" height="4" rx="2" fill="#f1f5f9"/>
    <rect x="65" y="130" width="105" height="5" rx="2.5" fill="#bd7b20" fillOpacity="0.2"/>
    <rect x="65" y="130" width="80" height="5" rx="2.5" fill="#bd7b20"/>

    {/* PDF card top-right */}
    <rect x="340" y="40" width="130" height="85" rx="16" fill="white" filter="url(#assets-shadow)"/>
    <rect x="356" y="56" width="45" height="55" rx="6" fill="#bd7b20" fillOpacity="0.1"/>
    <rect x="361" y="61" width="35" height="45" rx="4" fill="#bd7b20" fillOpacity="0.3"/>
    <rect x="365" y="66" width="27" height="4" rx="2" fill="#bd7b20" fillOpacity="0.6"/>
    <rect x="365" y="73" width="20" height="3" rx="1.5" fill="#bd7b20" fillOpacity="0.4"/>
    <rect x="365" y="79" width="23" height="3" rx="1.5" fill="#bd7b20" fillOpacity="0.4"/>
    <rect x="365" y="85" width="18" height="3" rx="1.5" fill="#bd7b20" fillOpacity="0.4"/>
    <rect x="365" y="91" width="22" height="3" rx="1.5" fill="#bd7b20" fillOpacity="0.4"/>
    {/* PDF label */}
    <rect x="410" y="62" width="48" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="410" y="72" width="36" height="4" rx="2" fill="#f1f5f9"/>
    <rect x="356" y="115" width="105" height="5" rx="2.5" fill="#a855f7" fillOpacity="0.2"/>
    <rect x="356" y="115" width="65" height="5" rx="2.5" fill="#a855f7"/>

    {/* Live class card bottom */}
    <rect x="310" y="270" width="150" height="80" rx="16" fill="white" filter="url(#assets-shadow)"/>
    <rect x="326" y="286" width="50" height="50" rx="25" fill="#f5f3ff"/>
    <circle cx="351" cy="311" r="18" fill="#a855f7" fillOpacity="0.2"/>
    <circle cx="351" cy="311" r="12" fill="#a855f7"/>
    <circle cx="351" cy="311" r="6" fill="#a855f7" fillOpacity="0.4"/>
    <circle cx="351" cy="311" r="3" fill="white"/>
    {/* LIVE badge */}
    <rect x="326" y="272" width="36" height="14" rx="4" fill="#ef4444"/>
    <text x="344" y="282.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="800">LIVE</text>
    <rect x="385" y="294" width="65" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="385" y="304" width="50" height="4" rx="2" fill="#f1f5f9"/>
    <rect x="385" y="312" width="55" height="4" rx="2" fill="#f1f5f9"/>
    {/* Participant avatars */}
    <circle cx="326" cy="336" r="10" fill="#fde2e8"/>
    <circle cx="344" cy="336" r="10" fill="#f7f1e5"/>
    <circle cx="362" cy="336" r="10" fill="#dcfce7"/>
    <circle cx="380" cy="336" r="10" fill="#fef9c3"/>
    <text x="326" y="340" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">P</text>
    <text x="344" y="340" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">R</text>
    <text x="362" y="340" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">A</text>
    <text x="380" y="340" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">M</text>
    <text x="390" y="340" textAnchor="middle" fill="#9ca3af" fontSize="8" fontWeight="600">+24</text>

    {/* Books stack left */}
    <rect x="50" y="310" width="100" height="20" rx="5" fill="#bd7b20"/>
    <rect x="50" y="292" width="95" height="18" rx="5" fill="#f97316"/>
    <rect x="52" y="276" width="90" height="16" rx="5" fill="#22c55e"/>
    <rect x="54" y="262" width="85" height="14" rx="5" fill="#ec4899"/>
    {/* Floating checkmark bottom-left */}
    <circle cx="100" cy="380" r="22" fill="#dcfce7"/>
    <circle cx="100" cy="380" r="14" fill="#22c55e"/>
    <path d="M94 380 L98 384 L107 375" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

    <defs>
      <filter id="assets-shadow" x="0" y="0" width="160" height="100" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.07"/>
      </filter>
    </defs>
  </svg>
);

const assets = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="11" fill="#f7f1e5"/>
        <circle cx="11" cy="11" r="7" fill="#bd7b20" fillOpacity="0.2"/>
        <circle cx="11" cy="11" r="4.5" fill="#bd7b20"/>
        <polygon points="10.3,9 10.3,13 13.7,11" fill="white"/>
      </svg>
    ),
    title:"Recorded Video Classes",
    desc:"HD lectures available for offline viewing  learn anytime.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="11" fill="#fef3c7"/>
        <rect x="7" y="4" width="8" height="14" rx="2" fill="#f59e0b" fillOpacity="0.4"/>
        <rect x="8.5" y="5.5" width="5" height="11" rx="1" fill="#f59e0b"/>
        <rect x="9" y="7" width="4" height="2" rx="1" fill="white"/>
        <rect x="9" y="10" width="3" height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
        <rect x="9" y="12" width="3.5" height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
      </svg>
    ),
    title:"PDF Notes & Study Material",
    desc:"Detailed downloadable notes for quick revision.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="11" fill="#f5f3ff"/>
        <circle cx="11" cy="11" r="7" fill="#a855f7" fillOpacity="0.2"/>
        <circle cx="11" cy="11" r="4" fill="#a855f7"/>
        <circle cx="11" cy="11" r="2" fill="#a855f7" fillOpacity="0.4"/>
        <circle cx="11" cy="11" r="1" fill="white"/>
      </svg>
    ),
    title:"Live Interactive Classes",
    desc:"Join live sessions for real-time doubt solving with faculty.",
  },
];

const AssetsInCourses = () => {
  return (
    <section className="assets-section">
      <div className="container">
        <div className="assets-split-layout">

          {/*  LEFT: Content  */}
          <div className="assets-content-side">
            <div className="assets-eyebrow">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#bd7b20"/></svg>
              <span>What You Get</span>
            </div>
            <h2 className="assets-main-title">
              Everything Included<br/>
              <span className="title-accent">With Every Course</span>
            </h2>
            <p className="assets-sub-text">
              No hidden charges. Every course comes packed with video lessons,
              downloadable notes, and live sessions  everything you need to crack your exam.
            </p>

            <div className="assets-feature-list">
              {assets.map((item, i) => (
                <div key={i} className="assets-feature-row">
                  <div className="assets-feature-icon">{item.icon}</div>
                  <div>
                    <h5 className="assets-feature-title">{item.title}</h5>
                    <p className="assets-feature-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/courses" className="assets-primary-btn">
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>

          {/*  RIGHT: Illustration  */}
          <div className="assets-illustration-side">
            <AssetsIllustration />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AssetsInCourses;
